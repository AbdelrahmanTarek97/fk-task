const mongoose = require('mongoose');
// Import database json file
const dbConfig = require("../connection/dbConfig.json")
// Create the schema for a user
const schema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true,
        match: /^[a-zA-Z0-9]+$/
    },
    password: {
        type: String,
        required: true,
        match: /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])[0-9a-zA-Z]{8,}$/
    },
    deposit: {
        type: Number,
        required: true,
        min: [0, "Deposit cannot be less than 0!"],
        max: [Number.MAX_VALUE, "Deposit cannot be this number, it's too huge!"]
    },
    role: {
        type: String,
        required: true,
        enum: ["buyer", "seller"]
    }
});

// Create the model using the schema, this model can be used later for making operations to this collection (users) in the database
module.exports = mongoose.model('User', schema);