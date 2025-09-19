const express = require('express');
const app = express();
const port = 3000;

// Middleware to parse JSON bodies (optional but useful for APIs)
app.use(express.json());

// A sample route
app.get('/', (req, res) => {
  res.send('Hello from your Node.js and Express backend!');
});

// Start the server
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});