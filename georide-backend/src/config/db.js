const mongoose = require("mongoose");
const dotenv = require("dotenv");

dotenv.config();

const DEFAULT_MONGODB_URI =
  "mongodb://admin:admin123@ac-g3iz3o3-shard-00-00.mbefyky.mongodb.net:27017,ac-g3iz3o3-shard-00-01.mbefyky.mongodb.net:27017,ac-g3iz3o3-shard-00-02.mbefyky.mongodb.net:27017/georide?ssl=true&replicaSet=atlas-8gr3az-shard-0&authSource=admin&retryWrites=true&w=majority";

const connectDB = async () => {
  try {
    console.log("Connecting to MongoDB...");

    await mongoose.connect(process.env.MONGODB_URI || DEFAULT_MONGODB_URI);

    console.log("MongoDB connected successfully");
  } catch (err) {
    console.error("MongoDB connection error:", err.message);
    throw err;
  }
};

module.exports = connectDB;
