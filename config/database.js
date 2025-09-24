const mongoose = require('mongoose');
require("dotenv").config();

const connectDB = async () => {
  let retries = 5; // Limit retries to avoid infinite loops
  while (retries) {
    try {
      await mongoose.connect(process.env.MONGODB_URI, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        serverSelectionTimeoutMS: 5000, // 5s for server selection
        socketTimeoutMS: 45000, // 45s for socket inactivity
        connectTimeoutMS: 10000, // 10s for initial connection
        maxPoolSize: 10, // Limit connection pool
        // ssl: true, // Explicit SSL for Atlas
        // sslValidate: true, // Validate server certificate
        // sslCA: undefined, // Use system CA
      });
      console.log('MongoDB connected successfully');
      return;
    } catch (err) {
      console.error('MongoDB connection error:', err);
      retries -= 1;
      console.log(`Retries left: ${retries}`);
      if (retries === 0) {
        throw new Error('Max retries reached, failed to connect to MongoDB');
      }
      await new Promise(resolve => setTimeout(resolve, 5000)); // Wait 5s
    }
  }
};

// Handle connection events
mongoose.connection.on('error', err => console.error('MongoDB error:', err));
mongoose.connection.on('disconnected', () => {
  console.log('MongoDB disconnected, attempting to reconnect...');
  connectDB().catch(err => console.error('Reconnection failed:', err));
});

module.exports = connectDB;