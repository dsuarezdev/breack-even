var mongoose = require('mongoose');
var Schema = mongoose.Schema;

// define the schema for our user model
var simcaseSchema = Schema({

    name        : {
        type    : String,
        trim    : true
    },
    code        : {
        type    : String,
        trim    : true
    },
    group       : [],
    url         : {
        type    : String,
        trim    : true
    },
    data        : Schema.Types.Mixed

}, { collection: 'simcase' });

// create the model for users and expose it to our app
module.exports = mongoose.model('Simcase', simcaseSchema);
