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
// Placeholder for auth middleware
const Auth = require('../middleware/auth')
// Placeholder for User model
let User;
// Placeholder for Product model
let Product;
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
        // Import User model
        User = require("../models/user")
    if (!Product)
        // Import Product model
        Product = require("../models/product")
    next();
})

// Use the JSON middleware which converts JSON content into Objects and vice-versa to allow for easier request processing
app.use(express.json());

// Create endpoint for creating a new Product
app.post("/product/create", Auth("seller"), async (req, res, next) => {
});

// Create endpoint for getting products
app.get("/products", Auth(null), (req, res) => {

});

// Create endpoint for updating a certain product
app.patch("/product/:id", Auth("seller"), async (req, res) => {

})

// Create an endpoint for deleting a product
app.delete("/product", Auth("seller"), async (req, res) => {

})

app.use((req, res, next) => {
    return res.status(404).json({
        error: "Not Found",
    });
});

// Expose APIs that are to be deployed by serverless
module.exports.handler = serverless(app);
