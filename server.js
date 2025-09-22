const express = require('express');
const mongoose = require("mongoose");


const app = express();

//routes 
const authRoutes = require("./routes/auth");

// Database connection
mongoose
  .connect(process.env.MONGODB_URI || "mongodb://localhost:27017/society-app")
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => console.error("MongoDB connection error:", err));

// Middleware to parse JSON bodies (optional but useful for APIs)
app.use(express.json());

// Routes
app.use("/api/auth", authRoutes);

// A sample route
app.get('/test', (req, res) => {
  res.send('Hello from your Node.js and Express backend!');
});

// Start the server
const port = process.env.PORT || 5000;
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});