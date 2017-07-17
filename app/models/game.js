var mongoose = require('mongoose');
var Schema = mongoose.Schema;

// define the schema for our user model
var gameSchema = Schema({

    name         : { type : String },
    access_type  : { type : String, default: 'link' },
    short_url    : { type : String, default: '' },
    players_text : { type : String },
    players      : [{ type : Schema.Types.ObjectId, ref: 'Player' }],
    registered   : [{ type: Schema.Types.Mixed, default: []}],
    created_by   : { type : String },
    status       : { type : String, default: 'saved' },
    started      : { type : Boolean, default: false },
    created_at   : { type: Date, default: Date.now }

}, {collection: 'game'});

// create the model for users and expose it to our app
module.exports = mongoose.model('Game', gameSchema);
