var mongoose = require('mongoose');
var bcrypt   = require('bcryptjs');
var Schema = mongoose.Schema;

// define the schema for our user model
var userSchema = Schema({

    api_id       : { type : String, index: true },
    email        : { type : String, lowercase : true, trim: true },
    token        : { type : String, trim: true },
    role         : { type : String, trim: true },
    name         : { type : String, trim: true },
    lastname     : { type : String, trim: true },

    // game fields
    correctness             : { type: Number, default: 0 },
    correctness_calculation : { type: Number, default: 0 },
    correctness_selection   : { type: Number, default: 0 },
    rounds                  : { type: Number, default: 0 },
    revenue                 : { type: Number, default: 0 },
    completed               : { type: Schema.Types.Mixed, defaults: 0 }

}, {collection: 'user'});

// create the model for users and expose it to our app
module.exports = mongoose.model('User', userSchema);
