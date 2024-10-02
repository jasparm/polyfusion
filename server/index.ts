import express from "express";
import { MongoClient, ServerApiVersion } from "mongodb";
import jwt from "jsonwebtoken";
import { DBApi } from "./api";
import { getShapeType, ShapeType } from "./types";

require("dotenv").config();

const uri = process.env.DB_URI;
const secret_key: string = process.env.SECRET_KEY!;
const cors = require('cors');

const client = new MongoClient(uri as string, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    },
});

export const app = express();
const port = process.env.PORT || 3000;
let db;
let db_api: DBApi;


app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors({
    origin:'http://localhost:8000',
    methods: ['GET', 'POST'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

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
            res.status(201).send("User Created");
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
            
            console.log("login request recieved")
            if (match) {
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

app.post("/storeshape", async (req, res) => {
    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.split(" ")[1];

    let auth;
    if (!token) return res.status(401).send("Token required");

    jwt.verify(token, secret_key, (err, username) => {
        if (err) return res.status(403).send("Invalid or expired token");
        auth = username;
    });

    const shape = req.body;
    if (auth && typeof auth == "object" && "user" in auth && shape) {
        //TODO: process shape, make sure it is correctly formatted
        const user = (auth as { user?: string }).user ?? "defaultUser";
        try {
            await db_api.storeShape(user, shape);
            res.status(201).send("Shape Stored");
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

app.get("/shapes/:dimension", async (req, res) => {
    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.split(" ")[1];

    let auth;
    if (!token) return res.status(401).send("Token required");

    jwt.verify(token, secret_key, (err, username) => {
        if (err) return res.status(403).send("Invalid or expired token");
        auth = username;
    });

    let shapetype: ShapeType | undefined

    try {
        shapetype = getShapeType(req.params.dimension)
    }
    catch (undefined) {
        res.status(400).send("Invalid shape type")
    }

    if (auth && typeof auth == "object" && "user" in auth) {
        const user = (auth as { user?: string }).user ?? "defaultUser";
        try {
            const shapes = await db_api.getShapes(user, shapetype!);
            res.status(200).json(shapes);
        } catch (error) {
            if (error instanceof Error) {
                res.status(400).send(error.message);
            } else {
                res.status(400).send(String(error));
            }
        }
    }
});

app.get("/shape/:dimension/:name", async (req, res) => {
    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.split(" ")[1];

    let auth;
    if (!token) return res.status(401).send("Token required");

    jwt.verify(token, secret_key, (err, username) => {
        if (err) return res.status(403).send("Invalid or expired token");
        auth = username;
    });

    const shapename = req.params.name
    let shapetype: ShapeType | undefined

    try {
        shapetype = getShapeType(req.params.dimension)
    }
    catch (undefined) {
        res.status(400).send("Invalid shape type")
    }
    
    if (auth && typeof auth == "object" && "user" in auth) {
        const user = (auth as { user?: string }).user ?? "defaultUser";
        try {
            const shape = await db_api.getShape(user, shapename, shapetype!);
            res.status(200).json(shape);
        } catch (error) {
            if (error instanceof Error) {
                res.status(400).send(error.message);
            } else {
                res.status(400).send(String(error));
            }
        }
    }
});


app.put("/updateshape:name", async (req, res) => {
    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.split(" ")[1];

    let auth;
    if (!token) return res.status(401).send("Token required");

    jwt.verify(token, secret_key, (err, username) => {
        if (err) return res.status(403).send("Invalid or expired token");
        auth = username;
    });

    const shapename = req.params.name.slice(1)
    const shape = req.body
    if (auth && typeof auth == "object" && "user" in auth) {
        const user = (auth as { user?: string }).user ?? "defaultUser";
        try {
            await db_api.updateShape(shapename, user, shape);
            res.status(200).send("Updated succesfully");
        } catch (error) {
            if (error instanceof Error) {
                res.status(400).send(error.message);
            } else {
                res.status(400).send(String(error));
            }
        }
    }
});

app.post("/deleteshape:name", async (req, res) => {
    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.split(" ")[1];

    let auth;
    if (!token) return res.status(401).send("Token required");

    jwt.verify(token, secret_key, (err, username) => {
        if (err) return res.status(403).send("Invalid or expired token");
        auth = username;
    });

    const shapename = req.params.name.slice(1)
    if (auth && typeof auth == "object" && "user" in auth) {
        const user = (auth as { user?: string }).user ?? "defaultUser";
        try {
            await db_api.deleteShape(shapename, user);
            res.status(200).send("Deleted succesfully");
        } catch (error) {
            if (error instanceof Error) {
                res.status(400).send(error.message);
            } else {
                res.status(400).send(String(error));
            }
        }
    }
});

startServer();
