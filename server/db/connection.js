import { MongoClient } from "mongodb";

process.loadEnvFile(new URL("../config.env", import.meta.url));

const uri = process.env.MONGODB_URI;
if (!uri) {
   throw new Error("MONGODB_URI is not configured.");
}

const client = new MongoClient(uri);
try {
   await client.connect();
   await client.db("admin").command({ ping: 1 });
   console.log("Connected to MongoDB.");
} catch(err) {
   console.error("MongoDB connection failed:", err);
   process.exitCode = 1;
}

let db = client.db("DessertArchitects");
export default db;