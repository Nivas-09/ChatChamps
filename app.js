require("dotenv").config();
const express = require("express");
const cors = require("cors");

const { connectDB, closeDB } = require("./db");

const userRoutes = require("./Routes/userroute");
const chatbotRoutes = require("./Routes/chatroutes");
const messageRoutes = require("./Routes/messageroute");

const app = express();

// Middleware
app.use(express.json());
app.use(cors());

// Routes
app.use("/api/users", userRoutes);
app.use("/api/chatbots", chatbotRoutes);
app.use("/api/messages", messageRoutes);

// Default route
app.get("/", (req, res) => {
  res.send("Welcome to ChatChamps API 🚀");
});

// Start the server only after connecting to DB
const HOST = "0.0.0.0";
const PORT = process.env.PORT || 5000;

connectDB().then(() => {
  app.listen(PORT, HOST, () => {
    console.log(`✅ Server running at http://${HOST}:${PORT}`);
  });
});

// Optional: Handle SIGINT to close DB connection on shutdown
process.on("SIGINT", async () => {
  await closeDB();
  process.exit(0);
});
