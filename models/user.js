const mongoose = require('mongoose');
// Import database json file
const dbConfig = require("../connection/dbConfig.json")
// Require crypto lib
const crypto = require("crypto");
// Create the schema for a user
const schema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true,
        match: /^[a-zA-Z0-9]+$/
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
    },
    // password: {
    //     type: String,
    //     required: true,
    //     match: /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])[0-9a-zA-Z]{8,}$/
    // },
    // These properties are for security, they replace the password field
    hash: String,
    salt: String
});

// Method to set salt and hash the password for a user 
schema.methods.setPassword = function (password) {
    // Creating a unique salt for a particular user 
    this.salt = crypto.randomBytes(16).toString('hex');
    // Hashing user's salt and password with 1000 iterations, 
    this.hash = crypto.pbkdf2Sync(password, this.salt,
        1000, 64, `sha512`).toString(`hex`);
};

// Method to check the entered password is correct or not 
schema.methods.validPassword = function (password) {
    var hash = crypto.pbkdf2Sync(password,
        this.salt, 1000, 64, `sha512`).toString(`hex`);
    return this.hash === hash;
};

// Create the model using the schema, this model can be used later for making operations to this collection (users) in the database
module.exports = mongoose.model('User', schema);