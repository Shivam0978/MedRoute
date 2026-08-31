const mongoose = require("mongoose");
const dns = require("dns");

// Fix for Windows/local ISP DNS resolvers rejecting SRV records
try {
  dns.setServers(["8.8.8.8", "1.1.1.1"]);
} catch (e) {
  // ignore if not supported
}

// Disable unhandled long query buffering to prevent 10s hangs
mongoose.set("bufferCommands", false);

const connectDB = async () => {
  const uri = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/mediroute";
  try {
    const conn = await mongoose.connect(uri, {
      dbName: "mediroute",
      serverSelectionTimeoutMS: 5000,
      connectTimeoutMS: 10000,
      socketTimeoutMS: 20000,
    });
    console.log(`[MongoDB] Connected successfully to ${conn.connection.host}/${conn.connection.name}`);
    return conn;
  } catch (error) {
    console.warn(`[MongoDB] Connection notice: ${error.message}`);
    console.warn("[MongoDB] If using MongoDB Atlas, make sure your IP is whitelisted (0.0.0.0/0) under Network Access.");
    return null;
  }
};

module.exports = connectDB;
