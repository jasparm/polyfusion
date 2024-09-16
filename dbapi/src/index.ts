import { DBApi } from "./api";
import { MongoClient, ServerApiVersion } from "mongodb";

// Define an interface for the environment
export interface Env {
    DB_PASS: string;
    DB_URI: string;
    SECRET_KEY: string;
}

async function connectDB(env: Env) {
    const uri = process.env.DB_URI;
    const secret_key: string = process.env.SECRET_KEY!;


    const client: MongoClient = new MongoClient(uri as string, {
        serverApi: {
            version: ServerApiVersion.v1,
            strict: true,
            deprecationErrors: true, 
            
        },
    });
}

export default {
    async fetch(request: Request, env: Env): Promise<Response> {
        const { pathname } = new URL(request.url);

        if (request.method === "POST" && pathname === "/signup") {
            return await handleSignup(request, env);

        } else if (request.method === "POST" && pathname === "/login") {
            return await handleLogin(request, env);

        } else if (request.method === "POST" && pathname === "/storeshape") {
            return await handleStoreShape(request, env);

        } else if (request.method === "GET" && pathname === "/shapes") {
            return await handleGetShapes(request, env);

        } else if (request.method === "GET" && pathname.startsWith("/shape")) {
            const shapeName = pathname.split("/")[2];
            return await handleGetShape(request, env, shapeName);
        }

        return new Response("Not Found", { status: 404 });
    }
} satisfies ExportedHandler<Env>;


async function handleSignup(request: Request, env: Env): Promise<Response> {
    const info = await request.json();

    if (info.user && info.pass) {
        // Store user in KV with hashed password
        const hashedPass = await hashPassword(info.pass);
        await env.USERS.put(info.user, hashedPass);
        return new Response("User Created", { status: 201 });
    } else {
        return new Response("Invalid request", { status: 400 });
    }
}

async function handleLogin(request: Request, env: Env): Promise<Response> {
    const info = await request.json();

    if (info.user && info.pass) {
        const storedHash = await env.USERS.get(info.user);

        if (storedHash && await verifyPassword(info.pass, storedHash)) {
            // Generate JWT token
            const token = await generateJWT({ user: info.user }, env.SECRET_KEY);
            return new Response(JSON.stringify({ token }), { status: 200 });
        } else {
            return new Response("Incorrect user details", { status: 401 });
        }
    } else {
        return new Response("Invalid request", { status: 400 });
    }
}

async function handleStoreShape(request: Request, env: Env): Promise<Response> {
    const authHeader = request.headers.get("authorization");
    const token = authHeader && authHeader.split(" ")[1];

    if (!token) return new Response("Token required", { status: 401 });

    const auth = await verifyJWT(token, env.SECRET_KEY);

    if (auth && auth.user) {
        const shape = await request.json();
        // Store shape in KV
        await env.SHAPES.put(`${auth.user}:${shape.name}`, JSON.stringify(shape));
        return new Response("Shape Stored", { status: 201 });
    } else {
        return new Response("Invalid or expired token", { status: 403 });
    }
}

async function handleGetShapes(request: Request, env: Env): Promise<Response> {
    const authHeader = request.headers.get("authorization");
    const token = authHeader && authHeader.split(" ")[1];

    if (!token) return new Response("Token required", { status: 401 });

    const auth = await verifyJWT(token, env.SECRET_KEY);

    if (auth && auth.user) {
        // Get all shapes for the user
        const shapes = await env.SHAPES.list({ prefix: auth.user });
        return new Response(JSON.stringify(shapes.keys), { status: 200 });
    } else {
        return new Response("Invalid or expired token", { status: 403 });
    }
}

async function handleGetShape(request: Request, env: Env, shapeName: string): Promise<Response> {
    const authHeader = request.headers.get("authorization");
    const token = authHeader && authHeader.split(" ")[1];

    if (!token) return new Response("Token required", { status: 401 });

    const auth = await verifyJWT(token, env.SECRET_KEY);

    if (auth && auth.user) {
        // Retrieve specific shape from KV
        const shape = await env.SHAPES.get(`${auth.user}:${shapeName}`);
        return shape ? new Response(shape, { status: 200 }) : new Response("Shape not found", { status: 404 });
    } else {
        return new Response("Invalid or expired token", { status: 403 });
    }
}

// Utility functions

async function hashPassword(password: string): Promise<string> {
    // Use crypto.subtle.digest to hash passwords
    const encoder = new TextEncoder();
    const data = encoder.encode(password);
    const hashBuffer = await crypto.subtle.digest("SHA-256", data);
    return bufferToHex(hashBuffer);
}

async function verifyPassword(password: string, hash: string): Promise<boolean> {
    const passwordHash = await hashPassword(password);
    return passwordHash === hash;
}

async function generateJWT(payload: object, secretKey: string): Promise<string> {
    // Use a simple library like jose for signing JWTs in Workers
    const header = {
        alg: "HS256",
        typ: "JWT",
    };

    const encoder = new TextEncoder();
    const keyData = encoder.encode(secretKey);
    const key = await crypto.subtle.importKey(
        "raw",
        keyData,
        { name: "HMAC", hash: "SHA-256" },
        false,
        ["sign"]
    );

    const encodedHeader = btoa(JSON.stringify(header));
    const encodedPayload = btoa(JSON.stringify(payload));
    const data = `${encodedHeader}.${encodedPayload}`;

    const signature = await crypto.subtle.sign("HMAC", key, encoder.encode(data));
    const signatureBase64 = btoa(String.fromCharCode(...new Uint8Array(signature)));

    return `${data}.${signatureBase64}`;
}

async function verifyJWT(token: string, secretKey: string): Promise<any> {
    // Simple JWT verification logic
    const [header, payload, signature] = token.split(".");

    const encoder = new TextEncoder();
    const keyData = encoder.encode(secretKey);
    const key = await crypto.subtle.importKey(
        "raw",
        keyData,
        { name: "HMAC", hash: "SHA-256" },
        false,
        ["verify"]
    );

    const data = `${header}.${payload}`;
    const signatureBuffer = Uint8Array.from(atob(signature), (c) => c.charCodeAt(0));

    const isValid = await crypto.subtle.verify("HMAC", key, signatureBuffer, encoder.encode(data));

    if (isValid) {
        return JSON.parse(atob(payload));
    } else {
        throw new Error("Invalid token");
    }
}

function bufferToHex(buffer: ArrayBuffer): string {
    return Array.from(new Uint8Array(buffer))
        .map((b) => b.toString(16).padStart(2, "0"))
        .join("");
}
