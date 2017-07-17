// Load models
var Game = require('../models/game');

// Load config
var configOauth = require('../../config/oauth.js')[process.env.NODE_ENV || 'development'];

// Load the helper
var HubAPI = require('../helpers/hubapiclient')(configOauth);

module.exports = {

    // Dashboard index
    index: function(req, res, next) {

        // Query by role
        var params = (req.session.user.role == 'instructor') ? {instructor: req.session.user.id} : {};

        Game.find(params).sort({_id: -1}).exec(function(err, games){

            // Catch the error
            if(err) return res.end(err);

            var saved     = games.filter(function(g){ return g.status == 'saved' });
            var launched  = games.filter(function(g){ return g.status == 'launched' });
            var finalized = games.filter(function(g){ return g.status == 'finalized' });

            return res.render('admin/dashboard', {
                req: req,
                saved: saved,
                launched: launched,
                finalized: finalized
            });

        })

    }

};
