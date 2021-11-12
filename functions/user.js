// Import serverless for deploying the project as serverless functions
const serverless = require("serverless-http");
// Import express for easier middleware setup and API exposure
const express = require("express");
// Import CORS middleware to enable cors
const cors = require("cors");
// Import mongoose
const mongoose = require("mongoose")
// Import database json file
const dbConfig = require("../connection/dbConfig.json")
// Placeholder for User model
let User;

// Initalize an express App!
const app = express();

// Enable CORS middleware
/*
Cross-origin resource sharing is a mechanism
that allows restricted resources on a web page
to be requested from another domain outside 
the domain
*/
app.use(cors());

// Check if database is connected or not
app.use(async (req, res, next) => {
  if (mongoose.connection.readyState !== 1) {
    uri = dbConfig.uri;
    await mongoose.connect(uri);
    console.log("db connected!");
  }
  if (!User)
    User = require("../models/user")
  next();
})

// Use the JSON middleware which converts JSON content into Objects and vice-versa to allow for easier request processing
app.use(express.json());

// Create endpoint for creating a new user
app.post("/user/register", async (req, res, next) => {
  let { body } = req;
  // Extract variables from the request body
  let { username, password, role } = body;
  // Validate username
  if (!username) {

  }
  // Validate password
  if (!password) {

  }
  // Validate role
  if (!role) {

  }
  // Set deposit to zero
  let deposit = 0;

  let user = new User({
    username, password, role, deposit
  })

  user = await user.save();

  // Create account
  return res.status(200).json({
    message: "User was created successfully!",
    user
  });
});

app.use((req, res, next) => {
  return res.status(404).json({
    error: "Not Found",
  });
});

// Expose APIs that are to be deployed by serverless
module.exports.handler = serverless(app);
