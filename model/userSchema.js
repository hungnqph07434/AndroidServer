let mongoose = require('mongoose');
let userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
    },
    password: {
        type: String,
        required: true,
    }
    /*
  ,
  Email:{
      type: String,
      match: /.+@.+\..+/,
      require: true
  }
*/
});

module.exports = userSchema;