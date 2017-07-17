// MODULES: Loading main modules
var express  = require('express');
var http     = require('http');
var app      = express();
var server   = http.createServer(app);
var io       = require('socket.io')(server);
var mongoose = require('mongoose');
var passport = require('passport');
var flash    = require('connect-flash');

var cookieParser = require('cookie-parser');
var bodyParser   = require('body-parser');
var session      = require('express-session');

var morgan       = require('morgan');
var morganDebug  = require('morgan-debug');

// CONFIGURATIONS
var configApp    = require('./config/app.js')[process.env.NODE_ENV || 'development'];
var configDB     = require('./config/database.js')[process.env.NODE_ENV || 'development'];
var configOauth  = require('./config/oauth.js')[process.env.NODE_ENV || 'development'];
require('./config/passport')(passport); // pass passport for configuration

var port     = process.env.PORT || configApp.port;


// MONGODB CONNECTIONS
mongoose.connect(configDB.url); // connect to our database


// EXPRESS: Tools setup
app.use(morganDebug('SC', 'combined')); // Console Debugger
app.use(cookieParser()); // read cookies (needed for auth)
app.use(bodyParser.json()); // get information from html forms
app.use(bodyParser.urlencoded({extended: true}));
app.use(function (req, res, next) {
   res.locals.makeURL = function(suburl){ return configOauth.site_url + suburl };
   next();
});

// STATIC Routing
app.use(express.static('public', { redirect : false })); // Setup the pubic folder (for serving static content)
app.use('/game_assets', express.static('game_assets', { redirect : false })); // Setup the assets folder (for serving static content)

// TEMPLATING: EJS
app.set('view engine', 'ejs'); // set up ejs for templating


//// SESSION + PASSPORT SETUP
app.use(session({ secret: 'mnzw47MQX0X' })); // session secret
//app.use(passport.initialize());
//app.use(passport.session()); // persistent login sessions
app.use(flash()); // use connect-flash for flash messages stored in session
app.use(function (req, res, next) {
    res.locals.messages = require('express-messages')(req, res);
    next();
});
app.use(function(req, res, next){
    res.locals.user = req.session.user;
    next();
});
app.use(function(req, res, next){
    res.locals.app = configApp;
    next();
});



// SOCKETS
var sockets = require('./app/helpers/sockets').listen(io);


// ROUTES
require('./app/routes.js')(app, io, configApp); // load our routes and pass in our app and fully configured passport


// LAUNCH THE APP
server.listen(port, function(){
    console.log('Current NODE_ENV: ' + process.env.NODE_ENV);
    console.log('The magic happens on port ' + port);
});
