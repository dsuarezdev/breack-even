/*
 * General javascript file
 * By @davoscript v.1
 */

var appbox = document.getElementById('appbox');

function appinit(o){


    // URL PARAMS
    var gameId      = getQueryVariable('i');
    var playerEmail = getQueryVariable('e');
    var playerToken = getQueryVariable('t');


    var item_type = '';
    var item_title = '';
    var result = {};
    var gameResult = {};
    var _max;
    var _chart;
    var chart;
    var _xaxis;
    var _yaxis;
    var _color;
    var scenario;

    // GLOBALS
    var gameData = {};
    var currentPlayerResults = [];
    var socket;
    var hubURL = '';
    var appURL = o.site_url;
    var clientID  = '';
    var debriefData;

    // ELEMENTS
    var loader = document.getElementById('loader');
    var popup = document.getElementById('popup');


    // Chart
    _chart;

    makeNavigable( appbox, document.getElementById('splash') );


    // ******************************
    // CONNECT & GET GAME INFO
    // ******************************

        // Init & Connect Socket
        socket = io.connect(o.io_domain, {path: o.io_path});

        // Enter the Game
        socket.emit('enter', {game_id: gameId, email: playerEmail, token: playerToken}, function(game){

            // Any errors?
            if( game.error )
                return console.log(game.error);

            // Nice, the game exists and we've joined!
            if( game._id ){

                gameData = game;
                console.log('gameData', gameData);

                // If game is "finalized", then *return* and move to the summary
                if( game.status == 'finalized' ){
                    toFrame(appbox, 'debrief-1', 'R', 'L', 300, false );
                    loader.classList.add('loading');
                }

                // If game is launched & started
                if( game.status == 'launched' ){

                     /* Screen 1 - */
                    document.getElementById('begin').addEventListener('click', function(){
                        toFrame(appbox, 'screen2', 'R', 'L', 300, false );
                        loader.classList.add('loading');
                    });

                }

            }

        });

        socket.on('finalize', function(){

            toFrame(appbox, 'debrief-1', 'R', 'L', 300, false );

        });

    // ******************************
    // END: CONNECT & GET GAME INFO
    // ******************************

    var menuAbout = document.getElementById('about');
    menuAbout.addEventListener('click', function(){
        document.getElementById('popup').innerHTML = 'About';

       var aboutHTML = '';
        aboutHTML += '<div class="text-center" style="padding:0 20px 0 20px;">';
        aboutHTML +=    '<p class="mt20"><i>Author: Author Name<br>Author Title</i></p>';
        aboutHTML +=    '<div>';
        aboutHTML +=        '<img src="game_assets/assets/logo_wide.png" alt="Logo"></div>';
        aboutHTML +=    '</div>';
        aboutHTML +=    '<p class="mt20">Copyright © 2017, Simcase</p>';
        aboutHTML += '</div>';

       alertModal('About', aboutHTML);

    });

    /**********************************************/
    /**************** GAME SCREENS ****************/
    /**********************************************/

    /* Screen 2 - ITEM TYPE SELECTION */
    var screen2 = document.getElementById('screen2');
    screen2.sreadyin = function(){
        loader.classList.remove('loading');

    }
    
}


    

    /**********************************************/
    /**************** /GAME SCREENS ***************/
    /**********************************************/

    /**********************************************/
    /**************** HELPERS *********************/
    /**********************************************/
