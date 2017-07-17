var configOauth         = require('../config/oauth.js')[process.env.NODE_ENV || 'development'];
var AuthController      = require('./controllers/auth');
var DashboardController = require('./controllers/dashboard');
var DebriefController   = require('./controllers/debrief');
var PlayController      = require('./controllers/play');
var SimcaseController   = require('./controllers/simcase');
var ScenarioController  = require('./controllers/scenario');
var ResultController    = require('./controllers/result');
var ResultController2   = require('./controllers/resultController');
var GamesController     = require('./controllers/games');

module.exports = function(app, io, appConfig) {

    // Instantiate the modules that has constructors
    PlayController  = new PlayController();
    GamesController = new GamesController(io);

    // =====================================
    // HOME PAGE
    // =====================================
    app.get('/', function(req, res) {
        res.render('index.ejs', {app: appConfig}); // load the index.ejs file
    });


    // =====================================
    // PLAY!
    // =====================================
    app.get('/join/:id',
        PlayController.join);

    app.get('/join-lti/:id/:token',
        PlayController.joinlti);

    app.get('/play',
        PlayController.index);

    app.get('/play/home',
        PlayController.index);

    // =====================================
    // DASHBOARD
    // =====================================
     app.get('/debrief',
        isLoggedIn,
        DebriefController.index);


    // =====================================
    // DASHBOARD
    // =====================================
    app.get('/dashboard',
        isLoggedIn,
        GamesController.index);

    app.get('/dashboard/report',
        isLoggedIn,
        ResultController2.listClassPerSimcase);

    app.get('/dashboard/reportParticipation',
        isLoggedIn,
        ResultController2.listParticipation);

    app.get('/dashboard/reportCSV',
        isLoggedIn,
        ResultController2.downloadCSV);


    // =====================================
    // ADMIN PANEL - GAMES
    // =====================================
    app.get('/admin/games',
        isLoggedIn,
        GamesController.index);

    app.get('/admin/games/create',
        isLoggedIn,
        GamesController.createForm);

    app.post('/admin/games/create',
        isLoggedIn,
        GamesController.create);

    app.get('/admin/games/update/:id',
        isLoggedIn,
        GamesController.updateForm);

    app.post('/admin/games/update/:id',
        isLoggedIn,
        GamesController.update);

    app.post('/admin/games/addplayer/:id',
        isLoggedIn,
        GamesController.addplayer);

    app.get('/admin/games/remove/:id',
        isLoggedIn,
        GamesController.remove);

    app.post('/admin/games/:id/rmemail/:email',
        isLoggedIn,
        GamesController.rmemail);

    app.get('/admin/games/launch/:id',
        isLoggedIn,
        GamesController.launch);

    app.get('/admin/games/pause/:id',
        isLoggedIn,
        GamesController.pause);

    app.get('/admin/games/unpause/:id',
        isLoggedIn,
        GamesController.unpause);

    app.get('/admin/games/finalize/:id',
        isLoggedIn,
        GamesController.finalize);

    app.get('/admin/games/gameboard/:id',
        isLoggedIn,
        GamesController.gameboard);

    app.get('/admin/games/start/:id/',
        isLoggedIn,
        GamesController.start);

    app.get('/admin/games/debrief/:id/',
        isLoggedIn,
        GamesController.debrief);

    app.get('/admin/games/csv/:id/',
        isLoggedIn,
        GamesController.csv);




    // =====================================
    // USER
    // =====================================
    app.get('/me',
        isLoggedIn,
        AuthController.me);


    // =====================================
    // SIMCASE
    // =====================================
    app.get('/simcase/:code',
        isLoggedIn,
        SimcaseController.find);

    app.get('/simcase/sections',
        isLoggedIn,
        SimcaseController.sectionBySimcase);


    // =====================================
    // SCENARIO
    // =====================================
    app.get('/scenario/:name',
        ScenarioController.find);

    // =====================================
    // RESULT
    // =====================================
    app.post('/result',
        isLoggedIn,
        ResultController.save);


    // =====================================
    // OAUTH
    // =====================================
    app.get('/oauth_provider', AuthController.oauth_provider);
    app.get('/oauth_callback', AuthController.oauth_callback);


    // =====================================
    // AUTHENTICATION
    // =====================================
    app.get('/logout', AuthController.logout);

};

// route middleware to make sure a user is logged in
function isLoggedIn(req, res, next) {

    // if user is authenticated in the session, carry on
    if ( typeof req.session.user != 'undefined' )
        return next();

    // if they aren't redirect them to the home page
    res.redirect(configOauth.site_url);
}
