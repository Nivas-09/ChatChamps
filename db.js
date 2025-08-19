const mongoose = require("mongoose");

let isConnected = false;

const connectDB = async () => {
  if (isConnected) {
    return;
  }

  try {
    await mongoose.connect(process.env.MONGO_URL, {});
    isConnected = true;
    console.log("✅ MongoDB Connected");
  } catch (err) {
    console.error("❌ MongoDB Connection Error:", err);
    throw err;
  }
};

const closeDB = async () => {
  try {
    await mongoose.connection.close();
    console.log("🛑 MongoDB Connection Closed");
  } catch (err) {
    console.error("❌ Error closing MongoDB connection:", err);
  }
};

module.exports = { connectDB, closeDB };
