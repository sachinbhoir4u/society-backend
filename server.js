const express = require('express');
// const mongoose = require("mongoose");
const connectDB = require('./config/database'); 
// require("dotenv").config();

const app = express();

//routes 
const authRoutes = require("./routes/auth");

// Database connection
// mongoose
//   .connect(process.env.MONGODB_URI || "mongodb://localhost:27017/society-app")
//   .then(() => console.log("Connected to MongoDB"))
//   .catch((err) => console.error("MongoDB connection error:", err));

// Middleware to parse JSON bodies (optional but useful for APIs)
app.use(express.json());

// Routes
app.use("/api/auth", authRoutes);

// A sample route
app.get('/api/test', (req, res) => {
  res.status(200).json({
    status: "OK",
    message: "Society App Backend is running",
    timestamp: new Date().toISOString(),
  })
});

// Start the server
const port = process.env.PORT || 5001;

connectDB().then(() => {
  app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
  });
}).catch((err) => {
  console.error('Failed to start server due to DB connection error:', err);
  process.exit(1); // Exit if DB connection fails
});