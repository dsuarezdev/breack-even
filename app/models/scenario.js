var mongoose = require('mongoose');
var Schema = mongoose.Schema;

// define the schema for our user model
var scenarioSchema = Schema({

    name        : {type: String, trim: true},
    items       : []

}, { collection: 'scenario' });

// create the model for users and expose it to our app
module.exports = mongoose.model('Scenario', scenarioSchema);
