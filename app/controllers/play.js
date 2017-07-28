// Load Models
var Game = require('../models/game');

var PlayController = function(io){


    // Global local variables
    var io = io;


    // INDEX
    this.index = function(req, res){

        return res.render('play');

    };


    // JOIN
    this.join = function(req, res){

        var gameId = req.params.id;
        return res.render('join', { game_id: gameId });

    };


    // JOIN-LTI
    this.joinlti = function(req, res){

        var gameId   = req.params.id;
        var token    = req.params.token;

        // Validate params
        Game.findOne({_id: gameId}).populate('players').exec(function(err, game){

            // Catch the error
            if(err) return res.send(err);

            if(!game)
                return res.render('error', { message: 'The game you are trying to access does not exists.' });

            // Validate if the user is already registered
            var alreadyRegistered = game.registered.find(function(r){ return r.registration_token == token });
            if( typeof alreadyRegistered == 'undefined' )
                return res.render('error', { message: 'You can\'t access this game because you don\'t seem to be registered or your token is wrong.' });

            // Game lauched and you're already a player? (This means game was launched)
            // Then redirect inmetiately
            var alreadyPlayer = game.players.find(function(p){ return p.email == alreadyRegistered.email });
            if( alreadyPlayer && (game.status == 'launched' || game.status == 'finalized') )
                return res.redirect(configOauth.site_url + '/play?i=' + gameId + '&e=' + alreadyPlayer.email + '&t=' + alreadyPlayer.token);

            return res.render('join-lti', { game_id: gameId, registered: alreadyRegistered });

        });

    };


}

module.exports = PlayController;
