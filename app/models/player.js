var mongoose = require('mongoose');
var Schema = mongoose.Schema;

// define the schema for our user model
var playerSchema = Schema({

    email     : { type : String, trim: true },
    name      : { type : String, trim: true },
    lastname  : { type : String, trim: true },
    game_id   : { type : Schema.Types.ObjectId, ref: 'Game' },
    token     : { type : String },
    results   : [{ type : Schema.Types.ObjectId, ref: 'Result', default: [] }]

}, {collection: 'player'});

// create the model for users and expose it to our app
module.exports = mongoose.model('Player', playerSchema);
