const express = require('express');
const app = express();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const secretKey = 'key';


app.use(express.json());

app.listen(3000, () => {
    console.log('Server running on port 3000');
});


let users = [];

// Signup route
app.post('/signup', async (req, res) => {
    const { username, password } = req.body;

    // Hash password

    bcrypt.hash(password, 8, function (err, hash) {
        users.push({ username, password: hash });
    });

    // Store user


    res.status(201).send('User created');
});

// At the top of your server.js


// Login route
app.post('/login', async (req, res) => {
    const { username, password } = req.body;
    const user = users.find(u => u.username === username);

    if (user) {
        bcrypt.compare(password, user.password, function (err, result) {
            const token = jwt.sign({ userId: user.username }, secretKey, { expiresIn: '1h' });
            res.status(200).send({ token });
        })
    };


});


// Middleware for token verification
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) return res.status(401).send('Token required');

    jwt.verify(token, secretKey, (err, user) => {
        if (err) return res.status(403).send('Invalid or expired token');
        req.user = user;
        next();
    });
};

// Protected route example
app.get('/dashboard', authenticateToken, (req, res) => {
    res.status(200).send('Welcome to the dashboard, ' + req.user.userId);
});