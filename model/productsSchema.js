let mongoose = require('mongoose');
let productsSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    image: {
        type: String,
        required: true,
    },
    price:{
        type: String,
        required: true,
    },
    specie:{
        type: String,
        required: true,
    },
    note:{
        type: String
    }
});

module.exports = productsSchema;