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
    try {
        // Extract user and body from the request
        let { user, body } = req;
        // Extract values from the body
        let { productName, amountAvailable, cost } = body;

        // Validate user input
        if (!(productName && Number.isFinite(amountAvailable) && Number.isFinite(cost))) {
            throw Error("All input fields: productName, amountAvailable, and cost are required!");
        }

        if (productName.length === 0 || productName.length > 30) {
            throw Error("Product name must be consisting of 1-30 characters!");
        }

        if (amountAvailable < 0) {
            throw Error("Amount available has to be equal to or greater than 0!");
        }

        if (cost <= 0) {
            throw Error("Cost has to be greater than 0!");
        }

        let product = new Product({ productName, amountAvailable, cost, sellerId: user.id });
        product = await product.save();
        return res.status(200).json({ message: "Product created successfully!" });

    } catch (err) {
        console.log(err);
        return res.status(400).send({ message: err.message });
    }
});

// Create endpoint for getting products
app.get("/product/all", Auth(null), async (req, res) => {
    try {
        let { user } = req;
        let page = req.query.page;
        // If this is a seller getting their own products
        let myProducts = req.query.myProducts;
        if (!page) page = 1;

        let query = {};

        if (myProducts) {
            query.sellerId = user.id;
        }

        let products = await Product.find(query).limit(5).skip((page - 1) * 5).sort('_id');
        return res.status(200).json({ message: "Products retrieved successfully!", products });

    } catch (err) {
        console.log(err);
        return res.status(400).send({ message: err.message });
    }
});

// Create endpoint for updating a certain product
app.patch("/product/:id", Auth("seller"), async (req, res) => {
    try {
        // Extract user, body, and path param from the request
        let { user, body } = req;
        let { id } = req.params;
        // Extract values from the body
        let { productName, amountAvailable, cost } = body;

        // find Product
        let product = await Product.findOne({ _id: id, sellerId: user.id });

        if (!product)
            throw Error("Product does not exist or cannot be edited by this user!")

        // validate existing fields
        if (productName) {
            if (productName.length === 0 || productName.length > 30) {
                throw Error("Product name must be consisting of 1-30 characters!");
            }
            product.productName = productName;
        }

        if (amountAvailable) {
            if (amountAvailable < 0) {
                throw Error("Amount available has be equal to or greater than 0!");
            }
            product.amountAvailable = amountAvailable;
        }
        if (cost) {
            if (cost <= 0) {
                throw Error("Cost has to be greater than 0!");
            }
            product.cost = cost;
        }

        product = await product.save();
        return res.status(200).json({ message: "Product edited successfully!", product });

    } catch (err) {
        console.log(err);
        return res.status(400).send({ message: err.message });
    }
})

// Create an endpoint for deleting a product
app.delete("/product/:id", Auth("seller"), async (req, res) => {
    try {

    } catch (err) {
        console.log(err);
        return res.status(400).send({ message: err.message });
    }
})

app.use((req, res, next) => {
    return res.status(404).json({
        error: "Not Found",
    });
});

// Expose APIs that are to be deployed by serverless
module.exports.handler = serverless(app);
