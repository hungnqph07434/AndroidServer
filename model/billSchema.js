let mongoose = require('mongoose');

let billSchema = new mongoose.Schema({
    idUser:{
        type: String,
        require: true
    },
    idProducts:{
        type: String,
        require: true
    },
    nameProduct:{
        type: String,
        require: true
    },
    imageProduct:{
        type: String,
        require: true
    },
    specieProduct:{
        type: String,
        require: true
    },
    priceProduct:{
        type: String,
        require: true
    },
    Amount:{
        type: String,
        require: true
    },
    Total:{
        type: String,
        require: true
    }


});

module.exports = billSchema;