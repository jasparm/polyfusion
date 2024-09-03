/*
const express = require('express')
const { MongoClient, ServerApiVersion } = require('mongodb')
*/
import express from "express";
import { MongoClient, ServerApiVersion } from "mongodb";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { DBApi } from "./api";

require("dotenv").config();

const uri = process.env.DB_URI;
const secret_key: string = process.env.SECRET_KEY!;

const client = new MongoClient(uri as string, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    },
});

const app = express();
const port = process.env.PORT || 3000;
let db;
let db_api: DBApi;

function signup(user: string, password: string) {}

app.use(express.json());
app.use(express.urlencoded({ extended: true }));





async function startServer() {
    try {
        await client.connect();
        db = client.db("test");
        console.log("Connected to MongoDB");

        db_api = new DBApi(db);

        app.listen(port, () => {
            console.log(`Server running on port ${port}`);
        });
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

app.post("/signup", async (req, res) => {
    const info = req.body;

    if (info.user && info.pass) {
        try {
            await db_api.signup(info.user, info.pass);
            res.status(201).json({ result: "User Created" });
        } catch (error) {
            if (error instanceof Error) {
                res.status(400).send(error.message);
            } else {
                res.status(400).send(String(error));
            }
        }
    } else {
        res.status(400).send("Invalid request");
    }
});

app.post("/login", async (req, res) => {
    const info = req.body;
    if (info.user && info.pass) {
        try {
            const match = await db_api.login(info.user, info.pass);

            if (match) {
                console.log(match);
                const token = jwt.sign({ user: info.user }, secret_key, {
                    expiresIn: "1h",
                });
                res.status(200).send({ token });
            } else {
                res.status(401).send("Incorrect user details");
            }
        } catch (error) {
            if (error instanceof Error) {
                res.status(400).send(error.message);
            } else {
                res.status(400).send(String(error));
            }
        }
    } else {
        res.status(400).json({ error: "Invalid request" });
    }
});

app.get("/shapes", async (req, res) => {
    const token = req.headers['authorization'];
    
    let user;
    if (!token) return res.status(401).send('Token required');

    jwt.verify(token, secret_key, (err, username) => {
        if (err) return res.status(403).send('Invalid or expired token');
        user = username;
    });

    console.log("token accepted")
    res.status(200).send("Token Accepted");
});

startServer();
