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
    var socketLayer = document.getElementById('connection-popup');
    var pauseLayer  = document.getElementById('pause-popup');

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




    /**********************************************/
    /**************** GAME SCREENS ****************/
    /**********************************************/


    /* Screen 1 - SPLASH SCREEN */
    var beginBtn = document.getElementById('begin');
    var screen1 = document.getElementById('screen1');
    screen1.sreadyin = function(){
        loader.classList.remove('loading');
    }

    beginBtn.addEventListener('click', function(e){
        loader.classList.add('loading');
        toFrame(appbox, 'screen2', 'R', 'L', 300, false );
    });


    /* Screen 2 */
    var btnToScreen3 = document.getElementById('to-screen-3');
    var screen2 = document.getElementById('screen2');
    screen2.sreadyin = function(){
        loader.classList.remove('loading');
        jQuery('#role-modal').modal('show');
    }

    btnToScreen3.addEventListener('click', function(){
        loader.classList.add('loading');
        toFrame(appbox, 'screen3', 'R', 'L', 300, false );
    });


    /* Screen 3 */
    var screen3 = document.getElementById('screen3');
    screen3.sreadyin = function(){
        loader.classList.remove('loading');
    }


    /* Screen 4 */
    var btnToScreen4 = document.getElementById('to-screen-4');
    var screen4 = document.getElementById('screen4');
    screen4.sreadyin = function(){
        loader.classList.remove('loading');

        Highcharts.chart('chart-1', {
            chart: { type: 'column', height: 200 },
            creadits: { enable: false },
            title: { text: '' },
            xAxis: {
                categories: ['Apples', 'Oranges', 'Pears', 'Grapes', 'Bananas']
            },
            yAxis: {
                min: 0,
                title: {
                    text: 'Total animals'
                }
            },
            series: [{
                name: 'John',
                data: [5, 3, 4, 7, 2]
            }, {
                name: 'Jane',
                data: [2, 2, 3, 2, 1]
            }, {
                name: 'Joe',
                data: [3, 4, 4, 2, 5]
            }]
        });

    }

    btnToScreen4.addEventListener('click', function(e){
        loader.classList.add('loading');
        toFrame(appbox, 'screen4', 'R', 'L', 300, false );
    });


    /**********************************************/
    /**************** /GAME SCREENS ***************/
    /**********************************************/




    /**********************************************/
    /**************** SOCKET EVENTS ***************/
    /**********************************************/

    // Pause
    socket.on('pause', function(){
        pauseLayer.classList.add('show');
    });

    // Unpause
    socket.on('unpause', function(){
        pauseLayer.classList.remove('show');
    });

    // Disconnection! :(
    socket.on('disconnect', function(){
        socketLayer.classList.add('show');
    });

    // Refresh on connection issue
    document.getElementById('refresh-btn').addEventListener('click', function(){
        window.onbeforeunload = undefined;
        location.reload();
    });

    /**********************************************/
    /*************** /SOCKET EVENTS ***************/
    /**********************************************/



    /**********************************************/
    /**************** HELPERS *********************/
    /**********************************************/

    var menuAbout = document.getElementById('about');
    menuAbout.addEventListener('click', function(){
        document.getElementById('popup').innerHTML = 'About';

       var aboutHTML = '';
        aboutHTML += '<div class="text-center" style="padding:0 20px 0 20px;">';
        aboutHTML +=    '<p class="mt20"><i>Author: Author Name<br>Author Title</i></p>';
        aboutHTML +=    '<div>';
        aboutHTML +=        '<img src="game_assets/assets/logo_wide.png" alt="Logo"></div>';
        aboutHTML +=    '</div>';
        aboutHTML +=    '<p class="mt20">Copyright © 2017, SimCase Co.</p>';
        aboutHTML += '</div>';

       alertModal('About', aboutHTML);

    });


}
