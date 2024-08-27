const express = require("express");
const path = require("path");
const expressLayouts = require("express-ejs-layouts");

const PORT = process.env.PORT || 3001;

const app = express();

// EJS setup
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, '../client/src')); // Set views directory to 'client/src'
app.use(expressLayouts);

// Static files
app.use(express.static(path.join(__dirname, '../client/public')));

// Route to render the EJS file
app.get('/', (req, res) => {
  res.render('partial/test', { data: "Your data here" });
});

// API route
app.get("/api", (req, res) => {
    res.json({ message: "Hello from the server!" });
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server is listening on port ${PORT}`);
});
