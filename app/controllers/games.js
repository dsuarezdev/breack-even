var request = require('request');

// Load Models
var Game = require('../models/game');
var Player = require('../models/player');

// Load Helpers
var Utils = require('../helpers/utils');
var EmailHelper = require('../helpers/email');

// Load config
var configOauth = require('../../config/oauth.js')[process.env.NODE_ENV || 'development'];
var configApp = require('../../config/app.js')[process.env.NODE_ENV || 'development'];

// Load the helper
var HubAPIClient = require('../helpers/hubapiclient')(configOauth);

var GamesModule = function(io){


    // Global local variables
    var io = io;


    // ************************* //
    // ** Local socket events ** //
    // ************************* //
    io.on('connection', function(socket){

        // Conect to game-setup socket room
        // This is usually executed when the player has been registered (LINK & LTI)
        socket.on('enter-setup', function(data, ack){

            Game.findOne({_id: data.game_id}).exec(function(err, game){

                // Catch the error
                if(err) return ack({ err });

                // Game lauched and you're already a player? Then redirect inmetiately
                var alreadyRegistered = game.registered.find(function(r){ return r.registration_token == data.registration_token });
                if( alreadyRegistered ){

                    // Join this socket to its own room
                    var playerRoom = 'game-' + data.game_id + '-' + alreadyRegistered.email;
                    socket.join(playerRoom, function(err){
                        if(err) return console.log(err);
                        console.log('Socket ' + socket.id + ' joined the room ' + playerRoom);
                    });

                    return ack({ email: alreadyRegistered.email });

                }

            });

        });

        // Join Player to the game setup
        socket.on('joinplayer', function(data, ack){

            Game.findOne({_id: data.game_id}).populate('players').exec(function(err, game){

                // Catch the error
                if(err) return ack({ err });

                // Game lauched and you're already a player? Then redirect inmetiately
                var alreadyPlayer = game.players.find(function(p){ return p.email == data.email });
                if( typeof alreadyPlayer != 'undefined' && (game.status == 'launched' || game.status == 'finalized')){
                    var magiclink = configOauth.site_url + '/play?i=' + data.game_id + '&e=' + alreadyPlayer.email + '&t=' + alreadyPlayer.token;
                    return ack({ link: magiclink });
                }

                // Game is finalized?
                if( game.status == 'finalized' )
                    return ack({ error: 'You can not register for this game at this time.' });

                // Already registered?
                var alreadyRegistered = game.registered.find(function(r){ return r.email == data.email; });
                if( alreadyRegistered ){
                    //return ack({ error: 'You have already been registered for this game.' });
                    alreadyRegistered.already = true;
                    return ack(alreadyRegistered);
                // No, the users is new!
                }else{
                    // Register the new player
                    var registration_token = Utils.uid(20);
                    game.registered.push({
                        email: data.email,
                        name: data.name,
                        lastname: data.lastname,
                        registration_token: registration_token
                    });
                }

                game.save(function(err){

                    // Catch the error
                    if(err) return ack({ err });

                    // Join this socket to its own room
                    var playerRoom = 'game-' + data.game_id + '-' + data.email;
                    socket.join(playerRoom, function(err){
                        if(err) return console.log(err);
                        console.log('Socket ' + socket.id + ' joined the room ' + playerRoom);
                    });

                    // Emmit this player data to the backend
                    var backendRoom  = 'game-backend-' + data.game_id;
                    io.sockets.in(backendRoom).emit('joinplayer', {
                        email: data.email,
                        name: data.name,
                        lastname: data.lastname
                    });

                    return ack({ email: data.email, name: data.name, lastname: data.lastname });

                });

            });

        });

    });


    // INDEX
    this.index = function(req, res){

        Game.find().sort({created_at: -1}).exec(function(err, games){

            // Catch the error
            if(err){
                req.flash('error', err);
                return res.redirect(configOauth.site_url + '/admin/games/');
            }

            // List the games
            return res.render('admin/games/list', {
                games: games,
                site_url: configOauth.site_url,
                controller: 'games',
                action: 'list_games',
            });

        });

    };


    // CREATE FORM (Route: GET /create)
    this.createForm = function(req, res){

        // Get the hub instructors
        HubAPIClient.getUsers({role: 'instructor'}, function(e, r, instructors){

            // Ok, Load the form view
            return res.render('admin/games/create', {
                instructors: instructors,
                headerTitle: 'New Game',
                site_url: configOauth.site_url,
                controller: 'games',
                action: 'new_game'
            });

        });

    };


    // CREATE
    this.create = function(req, res){

        var formParams = req.body;

        // Validate or change parameters??

        Game.create(formParams, function(err, newGame){

            // Catch the error
            if(err){
                req.flash('error', err);
                return res.redirect(configOauth.site_url + '/admin/games/create/');
            }

            var joinLink = configOauth.site_url + '/join/' + newGame.id;

            // Generate the short-URL
            request({
                uri: 'https://api.rebrandly.com/v1/links',
                method: 'POST',
                body: JSON.stringify({
                      destination: joinLink
                    , domain: { fullName: 'simcase.link' }
                }),
                    headers: {
                      "Content-Type": 'application/json',
                      "apikey": 'a60e910b48d44ae69e6e2860e6311366'
                    }
                }, function(err, response, body) {

                    if(err){
                        console.log(err);
                        req.flash('error', err);
                        return res.redirect(configOauth.site_url + '/admin/games/create/');
                    }

                    var link = JSON.parse(body);
                    console.log('Long URL was ' + link.destination + ', short URL is ' + link.shortUrl);
                    newGame.short_url = link.shortUrl;
                    newGame.save(function(err){

                        // Catch the error
                        if(err){
                            req.flash('error', err);
                            return res.redirect(configOauth.site_url + '/admin/games/create/');
                        }

                        // Ok
                        return res.redirect(configOauth.site_url + '/admin/games/update/' + newGame.id);

                    });

            });

            //return res.redirect(configOauth.site_url + '/admin/games/update/' + newGame._id);

        });

    };


    // UPDATE FORM (Handles GET request)
    this.updateForm = function(req, res){

        var gameId = req.params.id;

        // Validate if gameId exists
        // Here....

        Game.findOne({_id: gameId}).exec(function(err, game){

            // Catch the error
            if(err){
                req.flash('error', err);
                return res.redirect(configOauth.site_url + '/admin/games/update/' + gameId);
            }

            var update_view = '';
            switch( game.access_type ){
                case 'lms':
                    update_view = 'setup_lms';
                    break;
                case 'link':
                    update_view = 'setup_link';
                    break;
                case 'csv':
                    update_view = 'setup_csv';
                    break;
                default:
                    update_view = 'update';
                    break;
            }

            // Load the form view
            return res.render('admin/games/' + update_view, {
                game: game,
                o: configApp,
                site_url: configOauth.site_url,
                controller: 'games',
                action: 'setup',
                headerTitle: game.name
            });

        });

    };


    // UPDATE GAME (Handles POST request)
    this.update = function(req, res){

        // Get params (URL and FORM)
        var gameId = req.params.id;
        var playertxt = req.body.players_text || '';

        // Validate params
        // Here....

        // Get the current game
        Game.findOne({_id: gameId}).populate('players').exec(function(err, game){



            // Query error
            if(err){
                req.flash('error', err);
                return res.redirect(configOauth.site_url + '/admin/games/update/' + gameId);
            }

            // No game found or status is not saved (this means it's launched or finalized)
            if(!game || game.status != 'saved')
                return res.redirect(configOauth.site_url + '/admin/games');



            // Get the registered players
            var registeredPlayers = game.registered;

            // This only happens in CSV mode
            if( playertxt.length > 0 && game.access_type == 'csv' ){
                // Convert lines to registered objected
                var lines = (playertxt.length > 0) ? playertxt.split('\n') : [];

                // This should be legacy compatible
                var linesObjs = [];
                lines.forEach(function(l){
                    var tempArr = l.split(',');
                    linesObjs.push({ email: tempArr[0] || '', name: tempArr[1] || '', lastname: tempArr[2] || '', registration_token: '' });
                });
                registeredPlayers = (linesObjs.length > 0) ? linesObjs : [];
                console.log(registeredPlayers);
            }

            // CSV: If player text are is empty
            if( playertxt.length == 0 && game.access_type == 'csv' ){
                registeredPlayers = [];
            }

            // New: registered as an array of *object*
            if( registeredPlayers.length > 0 && typeof registeredPlayers[0] == 'object' ){
                // Trim emails
                registeredPlayers = registeredPlayers.map(function(pl){
                    return {
                        name: pl.name.trim(),
                        lastname: pl.lastname.trim(),
                        email: pl.email.trim(),
                        registration_token: pl.registration_token.trim()
                    };
                });
                // Avoid Duplicates: Validate if the email has already been added & not empty (item.length)
                registeredPlayers = registeredPlayers.filter(function(item, pos, selfArray) {
                    return (selfArray.findIndex(function(it){ return it.email == item.email }) == pos && item.email.length > 0);
                });
            }

            // Re-create the playertxt (CSV textarea)
            // Based on the registered players
            playertxt = registeredPlayers.map(function(p){
                var newline = p.email;
                newline += (p.name.length > 0) ? ', ' + p.name : '';
                newline += (p.lastname.length > 0) ? ', ' + p.lastname : '';
                return newline;
            }).join('\n');

            // Create the new players objects (including token) to saved
            var newPlayers = registeredPlayers.map(function(p){
                var token = Utils.uid(10);
                return {email: p.email, name: p.name, lastname: p.lastname, game_id: gameId, token: token};
            });

            // Delete the current ones, we'll use a callback
            Player.remove({game_id: gameId}, function(err){

                // Catch the error
                if(err){
                    req.flash('error', err);
                    return res.redirect(configOauth.site_url + '/admin/games/update/' + gameId);
                }

                // Create the new players
                Player.create(newPlayers).then(function(insertedPlayers) {

                    insertedPlayers = insertedPlayers || [];
                    var newPlayersIds = insertedPlayers.map(function(p){ return p._id; });
                    return newPlayersIds;

                // Let's use a promise to avoid too many nested callbacks
                }).then(function(newPlayers){

                    var gameParams = {
                        name: req.body.name,
                        access_type: req.body.access_type,
                        registered: registeredPlayers,
                        players_text: playertxt.trim(),
                        players: newPlayers // Set the new player IDs
                    };

                    // Update the current game record
                    Game.findOneAndUpdate({_id: gameId}, gameParams, {new: true}, function(err, newGame){

                        // Catch the error
                        if(err){
                            req.flash('error', err);
                            return res.redirect(configOauth.site_url + '/admin/games/update/' + gameId);
                        }

                        // Load the form view
                        return res.redirect(configOauth.site_url + '/admin/games/update/' + newGame._id);

                    });

                }).catch(function(err){
                    console.log(err);
                    req.flash('error', err);
                    return res.redirect(configOauth.site_url + '/admin/games/update/' + gameId);
                });

            });

        });

    };


    // UPDATE FORM (Handles GET request)
    this.remove = function(req, res){

        var gameId = req.params.id;

        // Validate if gameId exists

        Game.remove({ _id: gameId }).exec(function (err){

            // Catch the error
            if(err) req.flash('error', err);

            // Ok
            return res.redirect( configOauth.site_url + '/admin/games' );

        });

    };


    // Remove a registered player (from the game setup screen)
    this.rmemail = function(req, res){

        var gameId = req.params.id;
        var email = req.params.email;

        Game.findOne({_id: gameId}).exec(function(err, game){

            // Catch the error
            if(err || !game){
                return res.json({error: 'The game you are trying to access does not exist.'});
            }

            // Is saved?
            if( game.status != 'saved' )
                return res.json({ error: 'You can not remove players from this game at this time.' });

            // Find the registered player by email
            var index = game.registered.findIndex(function(el, i){ return el.email == email });

            // If an elem is found, then remove it
            if (index > -1) game.registered.splice(index, 1);

            // Save the game with the new elements
            game.save(function(err){

                // Catch the error
                if(err) return res.json(err);

                return res.json({ email: email });

            });

        });

    },


    // Add a new player to the game
    this.addplayer = function(req, res){

        var gameId    = req.params.id;
        var name      = req.body.name;
        var lastname  = req.body.lastname;
        var email     = req.body.email;

        // Validate params
        if( !email ) return res.json({ error: 'Invalid email address.' });

        // Get the game
        Game.findOne({_id: gameId}).populate('players').exec(function(err, game){

            // Catch the error
            if(err || !game){
                return res.json({error: 'The game you are trying to access does not exist.'});
            }

            // Is game finalized?
            if( game.status == 'finalized' )
                return res.json({ error: 'You can not add a player to a finalized game.' });

            // Already registered?
            var already = game.players.find(function(p){ return p.email == email });
            if( typeof already != 'undefined' )
                return res.json({ error: 'The email <strong>' + email + '</strong> has already been registered for this game.' });

            // Add this player to the registered field to keep the consistency
            var newPlayer = { email: email, name: name, lastname: lastname };
            game.registered.push(newPlayer);

            var token = Utils.uid(10);
            newPlayer.token = token;
            newPlayer.game_id = gameId;

            Player.create(newPlayer).then(function(insertedPlayer){

                game.players.push(insertedPlayer._id);

                // Save the game with the new elements
                game.save(function(err){

                    // Catch the error
                    if(err) return res.json(err);

                    var magiclink = configOauth.site_url + '/play?i=' + insertedPlayer.game_id + '&e=' + insertedPlayer.email + '&t=' + insertedPlayer.token;
                    EmailHelper.inviteToGame(insertedPlayer, magiclink, 'Your SimCase Invitation', configApp.name);

                    if( game.status == 'launched' ){
                        // IMPORTANT: This method MUST always be sent
                        // it is required to the right functioning of the platform
                        // Send the game event to the HUB (API)
                        HubAPIClient.gameEvent({
                            event: 'launch',
                            email: insertedPlayer.email,
                            client_id: configOauth.client_id,
                            sent_on: new Date(),
                            data: {}
                        });
                    }

                    return res.json(newPlayer);

                });

            });

        });

    },


    // LAUNCH GAME
    this.launch = function(req, res){

        var gameId = req.params.id;

        // Update the current game record
        Game.findOne({_id: gameId}).populate('players').exec(function(err, game){

            // Catch the error
            if(err){
                req.flash('error', err);
                return res.redirect(configOauth.site_url + '/admin/games/update/' + game._id);
            }

            // Validate state
            if( game.status == 'launched' || game.status == 'finalized' ){
                req.flash('error', 'Can not launch a game with <b>' + game.status + '</b> status.');
                return res.redirect(configOauth.site_url + '/admin/games/update/' + game._id);
            }

            // Update the game status
            game.status = 'launched';
            game.started = true;
            game.save(function(err){

                if(err){
                    req.flash('error', err);
                    return res.redirect(configOauth.site_url + '/admin/games/update/' + game._id);
                }

                // The game status was updated, now send the Magic-links
                game.players.forEach(function(p){

                    var magiclink = configOauth.site_url + '/play?i=' + p.game_id + '&e=' + p.email + '&t=' + p.token;
                    EmailHelper.inviteToGame(p, magiclink, 'Your SimCase Invitation', configApp.name);

                    // Send socket launch message to each player
                    var playerRoom = 'game-' + gameId + '-' + p.email;
                    io.sockets.in(playerRoom).emit('launch', {link: magiclink});

                    // IMPORTANT: This method MUST always be sent
                    // it is required to the right functioning of the platform
                    // Send the game event to the HUB (API)
                    HubAPIClient.gameEvent({
                        event: 'launch',
                        email: p.email,
                        client_id: configOauth.client_id,
                        sent_on: new Date(),
                        data: {}
                    });

                });


                // Load the form view
                return res.redirect(configOauth.site_url + '/admin/games/gameboard/' + game._id);

            })

        });

    };


    // PAUSE
    this.pause = function(req, res){

        var gameId = req.params.id;

        Game.findOneAndUpdate({_id: gameId}, {paused: true}, {new: true}, function(err, newGame){

            // Catch the error
            if(err){
                req.flash('error', err);
                res.redirect(req.get('referer'));
            }

            // Get the game room name & broadcast the event
            var gameRoom = 'game-' + gameId;
            io.sockets.in(gameRoom).emit('pause');

            // Load the form view
            res.redirect(req.get('referer'));

        });

    };


    // UNPAUSE
    this.unpause = function(req, res){

        var gameId = req.params.id;

        Game.findOneAndUpdate({_id: gameId}, {paused: false}, {new: true}, function(err, newGame){

            // Catch the error
            if(err){
                req.flash('error', err);
                res.redirect(req.get('referer'));
            }

            // Get the game room name & broadcast the event
            var gameRoom = 'game-' + gameId;
            io.sockets.in(gameRoom).emit('unpause');

            // Load the form view
            res.redirect(req.get('referer'));

        });

    };


    // FINALIZE
    this.finalize = function(req, res){

        var gameId = req.params.id;

        Game.findOneAndUpdate({_id: gameId}, {status: 'finalized'}, {new: true}).populate('players').exec(function(err, game){

            // Catch the error
            if(err){
                req.flash('error', err);
                res.redirect(req.get('referer'));
            }

            game.players.forEach(function(p){

                    // Send socket launch message to each player
                    var playerRoom = 'game-' + gameId + '-' + p.email;
                    io.sockets.in(playerRoom).emit('finalize');

            });

            // Load the form view
            return res.redirect(req.get('referer'));

        });
    };


    // SHARE MAGIC LINK
    this.shareByEmail = function (req, res, next) {

        var email = req.body.email;
        var link  = req.body.link;

        if( !email && !link )
            return res.json(false);

        var sent = EmailHelper.shareEmail({
            email: email,
            link: link,
            appname: configApp.name,
            subject: 'Your SimCase Invitation'
        });
        console.log('Sharing magiclink by email.', sent);

        return res.json(sent);

    };


    // GAMEBOARD
    this.gameboard = function(req, res){

        var gameId = req.params.id;

        Game.findOne({_id: gameId}).populate('players').exec(function(err, game){

            // Catch the error
            if(err){
                req.flash('error', err);
                return res.redirect(configOauth.site_url + '/admin/games/gameboard/' + game._id);
            }

            // Load the form view
            return res.render('admin/games/report_players', {
                game: game,
                site_url: configOauth.site_url,
                o: configApp,
                controller: 'games',
                action: 'gameboard',
                headerTitle: game.name
            });

        });

    };



    // DEBRIEF
    this.debrief = function(req, res){

        var gameId = req.params.id;

        Game.findOne({_id: gameId}).populate('players').exec(function(err, game){

            // Catch the error
            if(err){
                req.flash('error', err);
                res.redirect(req.get('referer'));
            }

            // Load the form view
            return res.render('admin/games/report_debrief', {
                game: game,
                site_url: configOauth.site_url,
                o: configApp,
                controller: 'games',
                action: 'debrief'
            });

        });

    },


    // CHART 1
    this.demochart = function(req, res){

        var gameId = req.params.id;

        Game.findOne({_id: gameId}).populate('players').exec(function(err, game){

            // Catch the error
            if(err){
                req.flash('error', err);
                res.redirect(req.get('referer'));
            }

            // Load the form view
            return res.render('admin/games/report_demochart', {
                game: game,
                site_url: configOauth.site_url,
                o: configApp,
                controller: 'games',
                action: 'debrief_demochart'
            });

        });

    },



    // DEBRIEF LEADERBOARD
    this.leaderboard = function(req, res){

        var gameId = req.params.id;

        Game.findOne({_id: gameId}).populate('players').exec(function(err, game){

            // Catch the error
            if(err){
                req.flash('error', err);
                res.redirect(req.get('referer'));
            }

            // Load the form view
            return res.render('admin/games/report_leaderboard', {
                game: game,
                site_url: configOauth.site_url,
                o: configApp,
                controller: 'games',
                action: 'debrief_leaderboard'
            });

        });

    },



    // START GAME
    this.start = function(req, res){

       var gameId = req.params.id;

        Game.findOneAndUpdate({_id: gameId}, {started: true}, {new: true}).populate('players').exec(function(err, newGame){

            // Catch the error
            if(err){
                req.flash('error', err);
                res.redirect(req.get('referer'));
            }

            // Get the game room name & broadcast the event
            var gameRoom = 'game-' + gameId;
            io.sockets.in(gameRoom).emit('start');

            // Load the form view
            return res.redirect(configOauth.site_url + '/admin/games/debrief/' + gameId);

        });

    };



    // CSV ROUNDS
    this.csv = function(req, res){

        var json2csv = require('json2csv');

        var gameId  = req.params.id;

        Game.findOne({_id: gameId}).populate('players').exec(function(err, game){

            // Catch the error
            if(err){
                req.flash('error', err);
                return res.redirect(configOauth.site_url + '/admin/games/gameboard/' + game._id);
            }

            // Define the fields
            var fields = ['name', 'surname', 'email', 'survey_name', 'survey_age', 'survey_location'];
            var data = [];

            game.players.forEach(function(p, pi){
                p.results.forEach(function(r, ri){
                    data.push({
                        order: ri+1,
                        name: p.name || '',
                        lastname: p.lastname || '',
                        email: p.email,
                        survey_name: r.quiz1.name,
                        survey_age: r.quiz1.age,
                        survey_location: r.quiz1.livesin
                    });
                });
            });

            //res.json(data);

            // CSV
            var csv = json2csv({ data: data, fields: fields }, function(err, file){

                if (err) return console.log( err );

                var filename = "game-" + gameId + ".csv";
                res.attachment(filename);
                return res.end(file, 'UTF-8');

            });

        });

    };


    return this;


};

module.exports = GamesModule;
