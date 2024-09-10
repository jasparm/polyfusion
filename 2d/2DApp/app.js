import express from "express";
import path from "path";
import expressLayouts from "express-ejs-layouts";
import { fileURLToPath } from 'url';
import { dirname } from 'path';

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

// Listening
app.listen(PORT_NUM, () => {
    console.log(`App listening on port number: ${PORT_NUM}.`);
});

// Saved shapes
let savedShapes = [];
let userTheme = 'light'; // Default theme
let users = []; // Array to store user login data

app.get('/shapes', (req, res) => {
    res.json(savedShapes);
});

// Serving the landing page
app.get("/", (req, res) => {
    res.render("landing", { title: "Polyfusion", savedShapes: savedShapes, theme: userTheme });
});

// Serving the 2D page
app.get("/2d", (req, res) => {
    res.render("index", { title: "Polyfusion", savedShapes: savedShapes, theme: userTheme });
});

// Serving the 3D page
app.get("/3d", (req, res) => {
    res.render("3d", { title: "Polyfusion", savedShapes: savedShapes, theme: userTheme });
});

// Using a post request to save shapes for now
app.post("/", (req, res) => {
    const newShape = req.body.shape;
    if (newShape) {
        savedShapes.push(newShape);
        console.log(savedShapes);
        res.json({ success: true });
    } else {
        res.status(400).json({ success: false, message: "Invalid shape data" });
    }
    console.log("received post");
});

// Route to handle theme changes
app.post("/theme", (req, res) => {
    const newTheme = req.body.theme;
    if (newTheme) {
        userTheme = newTheme;
        res.json({ success: true });
    } else {
        res.status(400).json({ success: false, message: "Invalid theme data" });
    }
});

// Route to handle login data
app.post("/login", (req, res) => {
    const { username, password } = req.body;
    if (username && password) {
        users.push({ username, password });
        res.json({ success: true });
    } else {
        res.status(400).json({ success: false, message: "Invalid login data" });
    }
});
