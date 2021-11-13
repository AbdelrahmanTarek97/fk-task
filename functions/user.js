// Import serverless for deploying the project as serverless functions
const serverless = require("serverless-http");
// Import express for easier middleware setup and API exposure
const express = require("express");
// Import CORS middleware to enable cors
const cors = require("cors");
// Import mongoose
const mongoose = require("mongoose");
// Import database json file
const config = require("../config/config.json");
// Import JWT
const jwt = require('jsonwebtoken');
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
    uri = config.dbUri;
    await mongoose.connect(uri);
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
      throw Error("Username cannot be empty!")
    }
    let match = username.match(/^[a-zA-Z0-9]+$/);
    if (!(match && username === match[0]))
      throw Error("Username can only consist of letters and numbers!")

    // check if user already exist
    // Validate if user exist in our database
    const oldUser = await User.findOne({ username });

    if (oldUser) {
      throw Error("User already exists. Please login!");
    }

    // Validate password
    if (!password) {
      throw Error("Password cannot be empty!")
    }
    match = password.match(/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])[0-9a-zA-Z]{8,}$/);
    if (!(match && password === match[0]))
      throw Error(`Password needs to contain: at least 8 characters, at least 1 number, at least 1 lowercase character (a-z), at least 1 uppercase character (A-Z)`)

    // Validate role
    if (!role) {
      throw Error("Role cannot be empty!")
    }
    if (!["buyer", "seller"].includes(role)) {
      throw error("Role needs to be either buyer or seller!")
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

    // Create JWT token for authentication
    const token = jwt.sign(
      { username, role },
      config.tokenPK,
      {
        expiresIn: config.tokenExpiresAfter,
      }
    );

    return res.status(200).json({
      message: "User was created successfully!",
      user: {
        username,
        role,
        deposit,
        token
      }
    });

  } catch (err) {
    console.log(err);
    return res.status(400).json({
      message: err.message
    })
  }
});

app.post("/user/login", async (req, res) => {
  // Our login logic starts here
  try {
    // Get user input
    const { username, password } = req.body;

    // Validate user input
    if (!(username && password)) {
      res.status(400).send({ message: "All input is required" });
    }
    // Validate if user exist in our database
    const user = await User.findOne({ username });

    if (user && (await user.validPassword(password))) {
      // Create token
      const token = jwt.sign(
        { username, role: user.role },
        config.tokenPK,
        {
          expiresIn: config.tokenExpiresAfter,
        }
      );

      // user
      return res.status(200).json({ token });
    }
    return res.status(400).send({ message: "Invalid Credentials" });
  } catch (err) {
    console.log(err);
    return res.status(400).send({ message: "Invalid Credentials" });
  }
});

app.use((req, res, next) => {
  return res.status(404).json({
    error: "Not Found",
  });
});

// Expose APIs that are to be deployed by serverless
module.exports.handler = serverless(app);
