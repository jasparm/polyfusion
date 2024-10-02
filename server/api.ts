import { MongoClient, ServerApiVersion, Db } from "mongodb";
import bcrypt from "bcryptjs";
import { Shape, Point, ShapeType, isShape, getShapeType} from "./types";

require("dotenv").config();



export class DBApi {
    db: Db;

    constructor(db: Db) {
        this.db = db;
    }

    async signup(this: DBApi, username: string, password: string) {
        /*
        Creates a user if one does not already exist with that name
        */
       
        if (username.includes("users")) { // Prevent user from overwriting users database
            throw new Error("Invalid username")
        }

        // Check if username already exists
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
                async (err: Error | null, hash: string) => { // Error handling for password hashing
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
        /*
        Check's user login details, returning True if correct username and password
        */
        const userAccount = await this.db
            .collection("users")
            .findOne({ user: username });

        if (!userAccount) {
            throw new Error("Incorrect user details");
        }

         // Verifies hash of input password and stored hash for user match
        const match = await bcrypt.compare(password, userAccount.pass);
        console.log("login req")
        return match;
    }

    async storeShape(this: DBApi, username: string, shape: Shape) {
        /*
        Stores a shape associated with a user
        */
        const existingShape = await this.db
            .collection(username)
            .findOne({ name: shape.name, type: shape.type});

        if (existingShape) {
            throw new Error("A shape with this name already exists");
        }

        if (!isShape(shape)) {
            throw new Error("Invalid shape provided")
        }
        
        try {
            const result = await this.db.collection(username).insertOne(shape);
            console.log(result);
        } catch (error) {
            console.error(error);
            throw error;
        }
    }

    async getShapes(this: DBApi, username: string, shapetype: ShapeType) {
        /*
        Returns all shapes associated with a username
        */
        try {
            const result = await this.db.collection(username).find({ type: getShapeType(shapetype) }).toArray();
            return result.map((shape) => {return shape.name});
        } catch (error) {
            console.error(error);
            throw error;
        }
    }

    async getShape(this: DBApi, username: string, shapename: string, shapetype: ShapeType) {
        /*
        Returns a user's shape called shapename if it exists
        */
        try {
            const result = await this.db
                .collection(username)
                .findOne({ name: shapename, type: shapetype.toString()});

            if (!result) {
                throw new Error("Item not found");
            } else {
                //console.log(result);
                return result;
            }
        } catch (error) {
            console.error(error);
            throw error;
        }
    }

    async updateShape(this: DBApi, shapeName: string, username: string, shape: Shape) {
        /*
        Updates a shape associated with a user based on shape name
        */
       if (shapeName != shape.name) {
        throw new Error("Invalid shape name provided")
       }
        const existingShape = await this.db
            .collection(username)
            .findOne({ name: shape.name });

        if (!existingShape) {
            throw new Error("A shape with this name doesn't exist");
        }
        try {
            const result = await this.db.collection(username).replaceOne({name: shapeName, type: shape.type}, shape);
            console.log(result);
        } catch (error) {
            console.error(error);
            throw error;
        }
    }

    async deleteShape(this: DBApi, shapeName: string, username: string) {
        /*
        Deletes a shape based on shape name
        */
       
        const existingShape = await this.db
            .collection(username)
            .findOne({ name: shapeName });

        if (!existingShape) {
            throw new Error("A shape with this name doesn't exist");
        }
        try {
            const result = await this.db.collection(username).deleteOne({ name: shapeName});
            console.log(result);
        } catch (error) {
            console.error(error);
            throw error;
        }
    }
}
