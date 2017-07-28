// Load Modules
var request = require('request');
var passport = require('passport');

// Load Models
var User = require('../models/user');
var Game = require('../models/game');

// Load Helpers
var HubAPI = require('../helpers/hubapi');
var Utils = require('../helpers/utils');

// Load config
var configOauth = require('../../config/oauth.js')[process.env.NODE_ENV || 'development'];
var configApp = require('../../config/app.js')[process.env.NODE_ENV || 'development'];

var AuthModule = function(io){

    // Global local variables
    var io = io;

    // OAUTH DATA
    this.oauth_provider = function(req, res, next) {

        res.json({
            site_url: configOauth.site_url,
            hub_url: configOauth.hub_url,
            client_id: configOauth.client_id,
            redirect_uri: configOauth.redirect_uri,
            scope: configOauth.scope,
            io_domain: configApp.io_domain,
            io_path: configApp.io_path
        });

    },

    // OAUTH CALLBACK
    this.oauth_callback = function(req, res, next) {

        var code = req.query.code;
        if( !code )
            res.send('Code missing.');

        request({
            url: configOauth.hub_url + '/oauth/token',
            method: 'POST',
            form: {
                client_id: configOauth.client_id,
                client_secret: configOauth.client_secret,
                grant_type: 'authorization_code',
                redirect_uri: configOauth.redirect_uri,
                code: code
            }
        }, function (error, response, body) {

            if (!error && response.statusCode == 200) {

                // Parse the response to JSON
                body = JSON.parse(body);

                // Get the ACCESS TOKEN
                var token = body.access_token;
                var refresh_token = body.refresh_token;

                if( !token )
                    res.error('Token not found');

                // Initialize the API Helper and try to get the user data
                new HubAPI({
                    api_url : configOauth.hub_url,
                    token   : token
                }).me(function(err, response, body){

                    // Insert or Update the user on the local db
                    User.update({_id: body.id}, {
                        api_id        : body.id,          // User ID on the API (HUB)
                        email         : body.email,       // User email
                        token         : token,            // User token to perform request to the API
                        refresh_token : refresh_token,
                        local_token   : Utils.uid(20),    // Generated local token to validate local requests
                        role          : body.role,        // User role
                        name          : body.name,        // User name
                        lastname      : body.lastname,    // User lastname
                        schools       : body.schools_refs
                    }, {upsert: true, setDefaultsOnInsert: true}, function(dberr, upserted){

                        // Login the user and add his token to the session
                        req.session.user = body;
                        req.session.user.token = token;

                        // Redirect the user
                        if( req.session.user.role == 'administrator' || req.session.user.role == 'instructor' )
                            res.redirect(configOauth.site_url + '/admin');
                        else
                            res.redirect(configOauth.site_url + '/play');

                    });

                });

            }else{
                res.json(response);
            }

        });

    },


    // OAUTH CALLBACK
    this.me = function(req, res, next) {

        if( typeof req.session.user == 'undefined' )
            return res.json({error: 'Not logged in?'});

        User.findOne({api_id: req.session.user.id}, function(err, user){

            if( err || !user )
                return res.json({error: 'User not found'})

            // Add the user name and lastname
            var returnedUser = user.toObject();
            returnedUser.name     = req.session.user.name;
            returnedUser.lastname = req.session.user.lastname;

            return res.json(returnedUser);

        });

    },


    // LTI LOGIN
    this.lti = function(req, res, next){

        passport.authenticate('lti-strategy', function(err, user, info) {

            if(err) return res.send(err);

            // Then, here's where the students land
            var gameId = req.params.game_id;
            if(typeof gameId == 'undefined' || gameId.length == 0)
                return res.send({error: 'Missing game parameter.'});

            // Instructor or Admin?
            if(user.role == 'instructor' || user.role == 'administrator'){

                // Login the user and add his token to the session
                req.session.user = user;
                req.session.user.token = null;

                // Find the game
                Game.findOne({_id: gameId}).exec(function(err, game){

                    if(err) return res.send(err);

                    if(!game)
                        return res.render('error', { message: 'The game (' + gameId + ') you are trying to access does not exists.' });

                    // Redirect the user
                    if( req.session.user.role == 'administrator' || req.session.user.role == 'instructor' ){
                        if( game.status != 'saved' )
                            return res.redirect(configOauth.site_url + '/admin/games/gameboard/' + gameId);
                        else
                            return res.redirect(configOauth.site_url + '/admin/games/update/' + gameId);
                    }

                });

            // Student
            }else{

                // Find the game
                Game.findOne({_id: gameId}).populate('players').exec(function(err, game){

                    if(err) return res.send(err);

                    if(!game)
                        return res.render('error', { message: 'The game you are trying to access does not exists.' });

                    // Validate if the user is already a player (game was launched!)
                    var alreadyPlayer = game.players.find(function(p){ return p.email == user.email });
                    if( alreadyPlayer && (game.status == 'launched' || game.status == 'finalized') )
                        return res.redirect(configOauth.site_url + '/play?i=' + gameId + '&e=' + alreadyPlayer.email + '&t=' + alreadyPlayer.token);

                    // Validate if the user is already registered
                    var alreadyRegistered = game.registered.find(function(r){ return r.email == user.email });
                    if( alreadyRegistered )
                        return res.redirect(configOauth.site_url + '/join-lti/' + gameId + '/' + alreadyRegistered.registration_token);

                    // Validate the game status
                    if( game.status != 'saved' )
                        return res.render('error', { message: 'You cannot register for this game at this time.' });

                    // Register the new player with his random token
                    var registration_token = Utils.uid(20);
                    game.registered.push({
                        email: user.email,
                        name: user.name,
                        lastname: user.lastname,
                        registration_token: registration_token
                    });
                    game.save(function(err){

                        // Catch the error
                        if(err) return res.send(err);

                        // Emmit this player data to the backend
                        var backendRoom  = 'game-backend-' + gameId;
                        io.sockets.in(backendRoom).emit('joinplayer', {email: user.email, name: user.name, lastname: user.lastname});

                        // Redirect the user to it's waiting screen using the registration token
                        return res.redirect(configOauth.site_url + '/join-lti/' + gameId + '/' + registration_token);

                    });

                });

            }

        })(req, res, next);

    },


    // LOGOUT
    this.logout = function(req, res, next) {
        req.session.destroy();
        return res.redirect(configOauth.hub_url + '/logout');
    }


};

module.exports = AuthModule;
