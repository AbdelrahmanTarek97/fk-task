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

  // Catch any validation errors
  try {
    // Validate username
    if (!username) {
      throw Error("username cannot be empty!")
    }
    let match = username.match(/^[a-zA-Z0-9]+$/);
    if (!(match && username === match[0]))
      throw Error("username can only consist of letters and numbers!")

    // Validate password
    if (!password) {
      throw Error("password cannot be empty!")
    }
    match = password.match(/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])[0-9a-zA-Z]{8,}$/);
    if (!(match && password === match[0]))
      throw Error(`password needs to contain: at least 8 characters, at least 1 number, at least 1 lowercase character (a-z), at least 1 uppercase character (A-Z)`)

    // Validate role
    if (!role) {
      throw Error("role cannot be empty!")
    }
    if (!["buyer", "seller"].includes(role)) {
      throw error("role needs to be either buyer or seller!")
    }

    // Set deposit to zero
    let deposit = 0;

    // Create a new user using the mongoose model
    let user = new User({
      username, role, deposit
    })

    // Set the user's password
    user.setPassword(password);

    // Create the user
    user = await user.save();

    return res.status(200).json({
      message: "User was created successfully!",
      user: {
        username,
        role,
        deposit
      }
    });

  } catch (err) {
    return res.status(400).json({
      message: err.message
    })
  }
});

app.use((req, res, next) => {
  return res.status(404).json({
    error: "Not Found",
  });
});

// Expose APIs that are to be deployed by serverless
module.exports.handler = serverless(app);
