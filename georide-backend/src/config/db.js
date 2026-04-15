const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    console.log("🔌 Connecting to MongoDB...");

    await mongoose.connect(
      "mongodb://admin:admin123@ac-g3iz3o3-shard-00-00.mbefyky.mongodb.net:27017,ac-g3iz3o3-shard-00-01.mbefyky.mongodb.net:27017,ac-g3iz3o3-shard-00-02.mbefyky.mongodb.net:27017/georide?ssl=true&replicaSet=atlas-8gr3az-shard-0&authSource=admin&retryWrites=true&w=majority"
    );

    console.log("✅ MongoDB Connected Successfully");
  } catch (err) {
    console.error("❌ MongoDB Connection Error:", err.message);
    process.exit(1);
  }
};

module.exports = connectDB;