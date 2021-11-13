const mongoose = require('mongoose');

// Create the schema for a product
const schema = new mongoose.Schema({
    productName: {
        type: String,
        required: true,
        unique: true,
        match: /^.{1,30}$/,
    },
    amountAvailable: {
        type: Number,
        required: true,
        min: [0, "Amount available cannot be less than 0!"],
        max: [Number.MAX_VALUE, "Amount available cannot be this number, it's too huge!"]
    },
    cost: {
        type: Number,
        required: true,
        min: [0, "Cost cannot be less than 0!"],
        max: [Number.MAX_VALUE, "Cost cannot be this number, it's too huge!"]
    },
    sellerId: {
        type: String,
        required: true,
    }
});

// Create the model using the schema, this model can be used later for making operations to this collection (products) in the database
try {
    Product = mongoose.model('Product')
} catch (error) {
    Product = mongoose.model('Product', schema);
}
module.exports = Product;