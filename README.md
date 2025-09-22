# society-backend
A backend application for a cooperative housing society, providing features like user registration, login, payments, and more. Built with Node.js, Express.js, and MongoDB to manage user data and society operations.

The society-backend is a RESTful API designed to manage operations for a cooperative housing society. It allows residents to register, log in and access society-related services. The application uses Node.js and Express.js for the server, MongoDB for data storage, and implements secure authentication using JSON Web Tokens (JWT).

**Features**
User Registration: Residents can create accounts with their details.
User Login: Secure authentication with JWT.
User Management: Admins can manage resident profiles and roles.
Society Announcements: Post and view society-wide announcements.
Secure APIs: Protected endpoints using JWT-based authentication.

**Technologies**
Node.js: JavaScript runtime for building the server.
Express.js: Web framework for creating RESTful APIs.
MongoDB: NoSQL database for storing user and society data.
Mongoose: ODM for MongoDB to manage schemas and queries.
JWT: JSON Web Tokens for secure authentication.
dotenv: For managing environment variables.
bcrypt: For hashing passwords.

**Prerequisites**
Node.js (v16 or higher)
MongoDB (Local or MongoDB Atlas)
npm (Node Package Manager)
Git (for cloning the repository)

**Installation**
Clone the Repository: git clone https://github.com/sachinbhoir4u/society-backend.git
cd society-backend

Install Dependencies:
 npm install
 
**Set Up MongoDB:**
Install MongoDB locally or use MongoDB Atlas for a cloud-based database.
Ensure MongoDB is running on mongodb://localhost:27017 or update the connection string in the environment variables.
Environment Variables
Create a .env file in the root directory and add the following variables:
PORT=3000
MONGODB_URI=mongodb://localhost:27017/societyDB
JWT_SECRET= "your-secrete-key"

PORT: Port where the server runs (default: 3000).
MONGODB_URI: MongoDB connection string (update if using MongoDB Atlas).
JWT_SECRET: Secret key for JWT signing (use a secure, random key; the provided key is from a previous response for consistency).
Running the Application
Start the Server:

 npm start
 The server will run on http://localhost:3000 (or the port specified in .env).

Test the API:
Use tools like Postman or cURL to test the API endpoints.


API Endpoints
Below are the main API endpoints. All protected routes require a valid JWT in the Authorization header as Bearer <token>
