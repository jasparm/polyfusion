import express from "express";
import path from "path";
import expressLayouts from "express-ejs-layouts";
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import session from 'express-session';

// Port number
const PORT_NUM = 8000;

// Getting __dirname equivalent in ES6 modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Setting up the app
let app = express();

// EJS stuff
app.set("view engine", "ejs");
// Setting the directory for EJS templates and files
app.set('views', path.join(__dirname, "views"));
app.use(expressLayouts);

// Middleware to parse url-encoded
app.use(express.urlencoded({ extended: true }));
// JSON
app.use(express.json());

// This is for our bootstrap, css and js
app.use(express.static(path.join(__dirname, "public")));
app.use("/css", express.static(path.join(__dirname, "node_modules/bootstrap/dist/css")));
app.use("/js", express.static(path.join(__dirname, "node_modules/bootstrap/dist/js")));
app.use("/js", express.static(path.join(__dirname, "node_modules/p5/lib/p5.min.js")));
app.use("/js", express.static(path.join(__dirname, "node_modules/p5/lib/p5.js")));

// Session setup
app.use(session({
    secret: 'your_secret_key', // Replace with a strong secret key
    resave: true,
    saveUninitialized: true,
    cookie: { secure: false } // Set to true if using HTTPS
}));

// Array to store user login data
let users = [];

// Array to store shapes
let shapes = [];

// Middleware to set login status
app.use((req, res, next) => {
    res.locals.loggedIn = !!req.session.userId;
    next();
});

// Route to handle login data
app.post("/login", (req, res) => {
    console.log("Login route hit"); 
    const { username, password } = req.body;
    console.log(`Username: ${username}, Password: ${password}`); 
    if (username && password) {
        // Check if user exists
        const user = users.find(u => u.username === username && u.password === password);
        if (user) {
            req.session.userId = user.username; 
            console.log(user.savedShapes)
            req.session.savedShapes = user.savedShapes || []; 
            req.session.userTheme = user.userTheme || 'light'; 
            console.log("Login successful");
            console.log(users);
            console.log("hihihihi");
            res.redirect('/'); // Redirect to home page after successful login
        } else {
            console.log("Invalid credentials");
            res.status(400).send("Invalid credentials");
        }
    } else {
        res.status(400).send("Invalid login data");
    }
});

// Route to handle sign-up data
app.post("/signup", (req, res) => {
    const { username, password } = req.body;
    if (username && password) {
        // Check if user already exists
        const userExists = users.some(u => u.username === username);
        if (userExists) {
            console.log("User already exists");
            res.status(400).send("User already exists");
        } else {
            const newUser = { username, password, savedShapes: [], userTheme: 'light' };
            users.push(newUser);
            req.session.userId = newUser.username; 
            req.session.savedShapes = newUser.savedShapes;
            req.session.userTheme = newUser.userTheme;
            console.log(users);
            res.redirect('/'); // Redirect to home page after successful sign-up
        }
    } else {
        res.status(400).send("Invalid sign-up data");
    }
});

// Route to handle logout
app.post("/logout", (req, res) => {
    req.session.destroy(err => {
        if (err) {
            return res.status(500).json({ success: false, message: "Failed to log out" });
        }
        console.log("byebye")
        res.redirect('/'); // Redirect to home page after logout
    });
});

// Route to check login state
app.get('/check-login', (req, res) => {
    if (req.session.userId) {
        res.json({ loggedIn: true });
    } else {
        res.json({ loggedIn: false });
    }
});

// Serving the landing page
app.get("/", (req, res) => {
    res.render("landing", { title: "Polyfusion", page: "landing", savedShapes: shapes, theme: req.session.userTheme || 'light', loggedIn: res.locals.loggedIn });
});

// Serving the 2D page
app.get("/2d", (req, res) => {
    res.render("index", { title: "Polyfusion", page: "index", savedShapes: shapes, theme: req.session.userTheme || 'light', loggedIn: res.locals.loggedIn });
});

// Serving the 3D page
app.get("/3d", (req, res) => {
    res.render("3d", { title: "Polyfusion", page: "3D", savedShapes: shapes, theme: req.session.userTheme || 'light', loggedIn: res.locals.loggedIn });
});

// Using a post request to save shapes for now
app.post("/", (req, res) => {
    const newShape = req.body.shape;
    if (newShape) {
        shapes.push(newShape);
        console.log(shapes);
        res.json({ success: true });
    } else {
        res.status(400).json({ success: false, message: "Invalid shape data" });
    }
    console.log("received post");
});

app.get("/get-saved-shapes", (req, res) => {
    res.json(shapes);
});

// Listening
app.listen(PORT_NUM, () => {
    console.log(`App listening on port number: ${PORT_NUM}.`);
});
