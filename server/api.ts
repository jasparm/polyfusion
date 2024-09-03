import { MongoClient, ServerApiVersion, Db } from "mongodb";
import bcrypt from "bcryptjs";

require("dotenv").config();

export class DBApi {
    db: Db;

    constructor(db: Db) {
        this.db = db;
    }

    async signup(this: DBApi, username: string, password: string) {
        const existingUser = await this.db
            .collection("users")
            .findOne({ user: username });

        if (existingUser) {
            throw new Error("User already exists");
        }

        try {
            bcrypt.hash(
                password,
                10,
                async (err: Error | null, hash: string) => {
                    if (err) {
                        throw err;
                    }
                    const newUser = { user: username, pass: hash };
                    const result = await this.db
                        .collection("users")
                        .insertOne(newUser);

                    return result;
                }
            );
        } catch (err) {
            console.error(err);
            
        }
    }

    async login(this: DBApi, username: string, password: string) {
        const userAccount = await this.db
            .collection("users")
            .findOne({ user: username });

        if (!userAccount) {
            throw new Error("Incorrect user details");
        }
        
        const match = await bcrypt.compare(password, userAccount.pass);
        
        return match
    }

    
}
