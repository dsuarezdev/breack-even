var mongoose = require('mongoose');
var Schema = mongoose.Schema;

// Load Models
var User    = require('../models/user');

// SCHEMA
var resultSchema = Schema({

    user_id       : { type : String, ref: 'User' },
    game_id    : { type : String, trim: true, ref: 'Simcase' },
    result        : { type : Schema.Types.Mixed, default: {} },
    scenario_type : {type : String}

}, {collection: 'result'});

resultSchema.index({ user_id: 1, game_id: 1, scenario_type: 1}, { unique: true });
// EXPORT THE MODEL
module.exports = mongoose.model('Result', resultSchema);
