const express = require("express");

const PORT = process.env.PORT || 3001;

const app = express();

app.get("/api", (req, res) => {
    res.json({message: "Hello from the server!"});
})


// Start the server
app.listen(PORT, () => {
    console.log(`Server is listening on port ${PORT}`);
})