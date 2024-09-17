import express from "express";
import path from "path";
import expressLayouts from "express-ejs-layouts";
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import ejs from "ejs";
import { createServer as createViteServer } from 'vite';

// Port number
const PORT_NUM = 8000;

// Getting __dirname equivalent in ES6 modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Setting up the app
let app = express();
const vite = await createViteServer( {
    server: {middlewareMode: 'html'}
})

app.use(vite.middlewares)

// EJS stuff
// app.engine("html", ejs.renderFile);
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
// app.use("/three", express.static(path.join(__dirname, "node_modules/three/build")));

  // Route to serve the Vite app
  app.get("/", async (req, res, next) => {
    try {
      const template = `
        <!DOCTYPE html>
        <html lang="en">
          <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Vite + Express</title>
            <script type="module" src="/src/main.js"></script>
          </head>
          <body>
            <div id="app"></div>
          </body>
        </html>
      `;

      // Serve the Vite app template with hot reload during development
      res.status(200).set({ "Content-Type": "text/html" }).end(template);
    } catch (e) {
      vite.ssrFixStacktrace(e);
      next(e);
    }
  });

// Listening
app.listen(PORT_NUM, () => {
    console.log(`App listening on port number: ${PORT_NUM}.`);
});

// Saved shapes
let savedShapes = [];

app.get('/shapes', (req, res) => {
    res.json(savedShapes);
});

// Only serving home page for now.
app.get("/", (req, res) => {
    res.render("index", { title: "Polyfusion", savedShapes: savedShapes });
});

// Using a post request to save shapes for now
app.post("/", (req, res) => {
    // Getting the shape posted
    const newShape = req.body.shape;
    if (newShape) {
        // Pushing to the list
        //! Change this to db.insertOne() when we use Mongo
        savedShapes.push(newShape);
        console.log(savedShapes)
        res.json( {success: true} );
    } else {
        res.status(400).json({ success: false, message: "Invalid shape data" });
    };
    console.log("received post");
});

app.get("/3d", (req, res) => {
    res.render("three", { title: "Polyfusion", savedShapes: savedShapes })
})