// Load Models
var Game = require('../models/game');
var Player = require('../models/player');
var Result = require('../models/result');

module.exports.listen = function(io){


    // Socket client connected
    io.on('connection', function(socket){

        console.log(':::: SOCKET: A user connected: ' + socket.id);

        socket.on('enter-backend', function(data, ack){

            // Validations
            if( !data.game_id ) return ack({ error: 'Invalid game id.' });

            // Get the game
            Game.findOne({_id: data.game_id}).exec(function(err, game){

                // Catch the error
                if(err) return ack({ error: err });

                // Game?
                if( !game ) return ack({ error: 'The game room does not exists.' });

                // Join this socket to the game room
                var backendRoom = 'game-backend-' + data.game_id;
                socket.join(backendRoom, function(err){

                    if(err) return console.log(err);

                    return console.log('Backend socket joined in room: '+backendRoom);

                });

                // Game status
                var gameData = game;

                return ack(gameData);

            });

        });

        // ENTER
        socket.on('enter', function(data, ack){

            // Validations
            if( !data.game_id ) return ack({ error: 'Invalid game id.' });
            if( !data.email ) return ack({ error: 'Invalid email address.' });
            if( !data.token ) return ack({ error: 'Invalid token.' });

            // Get the game
            Game.findOne({_id: data.game_id}).populate('players').populate('estimates').exec(function(err, game){

                // Catch the error
                if(err) return ack({ error: err });

                // Game?
                if( !game ) return ack({ error: 'The game room does not exists.' });

                // User belongs to this room? (look for him in the game players list)
                var player = game.players.find(function(p){ return (p.email == data.email && p.token == data.token) });
                if( typeof player == 'undefined' ) return ack({ error: 'You do not belong to this room.' });


                // Join this socket to the game room
                var gameRoom = 'game-' + data.game_id;
                socket.join(gameRoom, function(err){

                    if(err) return console.log(err);

                    return console.log('Socket ' + socket.id + ' joined the room ' + gameRoom);

                });

                // Join this socket to his own room
                var playerRoom = 'game-' + data.game_id + '-' + data.email;
                socket.join(playerRoom, function(err){
                    if(err) return console.log(err);
                    console.log('Socket ' + socket.id + ' joined the room ' + playerRoom);
                });

                var gameData = game;
                return ack(game);

            });

        });


        // RESULT
        socket.on('result', function(data, ack){

            // Validations
            if( !data.game_id ) return ack({ error: 'Invalid game id.' });
            if( !data.email ) return ack({ error: 'Invalid email address.' });
            if( !data.token ) return ack({ error: 'Invalid token.' });

            Game.findOne({_id: data.game_id}).populate('players').exec(function(err, game){

                // Game?
                if( !game ) return ack({ error: 'The game room does not exists.' });

                // User belongs to this room? (look for him in the game players list)
                var player = game.players.find(function(p){ return (p.email == data.email && p.token == data.token) });
                if( typeof player == 'undefined' ) return ack({ error: 'You do not belong to this room.' });

                console.log(player);

                player.results.push( data.result );

                console.log(player);

                game.save(function(err){
                    if( err ) console.log(err);
                    return ack(data.result);
                });

            });

        });

        // PLAYER RESULT
        socket.on('getPlayerResults', function(data, ack){

            // Validations
            if( !data.game_id ) return ack({ error: 'Invalid game id.' });
            if( !data.user_id ) return ack({ error: 'Invalid email address.' });
            if( !data.token ) return ack({ error: 'Invalid token.' });

            return ack([]);

        });

        // GAME RESULT
        socket.on('getGameResults', function(data, ack){

            // Validations
            if( !data.game_id ) return ack({ error: 'Invalid game id.' });

            return ack([]);

        });

    });

    return io;

}
