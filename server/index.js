import express from 'express';
import { MongoClient, ServerApiVersion } from 'mongodb';

const app = express();
const port = process.env.PORT || 3000;

// MongoDB connection URI
const uri = "mongodb+srv://jaspar:NWHVtijj4GV2YDfY@polyfusion.bmkafcl.mongodb.net/?retryWrites=true&w=majority&appName=PolyFusion";

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

let db;

// Middleware to parse JSON bodies
app.use(express.json());

// Connect to MongoDB and start the server
async function startServer() {
  try {
    await client.connect();
    db = client.db("test"); 
    console.log("Connected to MongoDB");

    // Start the Express server
    app.listen(port, () => {
      console.log(`Server running on port ${port}`);
    });
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

// Basic CRUD routes

// Create a new document
app.post('/items', async (req, res) => {
  try {
    const newItem = req.body;
    const result = await db.collection('items').insertOne(newItem);
    res.status(201).json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Read all documents
app.get('/items', async (req, res) => {
  try {
    const items = await db.collection('items').find().toArray();
    res.status(200).json(items);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Read a single document by ID
app.get('/items/:id', async (req, res) => {
  try {
    const id = req.params.id;
    const item = await db.collection('items').findOne({ _id: new MongoClient.ObjectId(id) });
    if (!item) {
      res.status(404).json({ error: "Item not found" });
    } else {
      res.status(200).json(item);
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update a document by ID
app.put('/items/:id', async (req, res) => {
  try {
    const id = req.params.id;
    const updatedItem = req.body;
    const result = await db.collection('items').updateOne({ _id: new MongoClient.ObjectId(id) }, { $set: updatedItem });
    if (result.matchedCount === 0) {
      res.status(404).json({ error: "Item not found" });
    } else {
      res.status(200).json(result);
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Delete a document by ID
app.delete('/items/:id', async (req, res) => {
  try {
    const id = req.params.id;
    const result = await db.collection('items').deleteOne({ _id: new MongoClient.ObjectId(id) });
    if (result.deletedCount === 0) {
      res.status(404).json({ error: "Item not found" });
    } else {
      res.status(204).send();
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Start the server
startServer();