// load all the things we need
var LocalStrategy   = require('passport-local').Strategy;
var LTIStrategy     = require('passport-lti');

// load up the user model
var User            = require('../app/models/user');

// expose this function to our app using module.exports
module.exports = function(passport) {


    // =========================================================================
    // passport session setup ==================================================
    // =========================================================================
    // required for persistent login sessions
    // passport needs ability to serialize and unserialize users out of session

    // used to serialize the user for the session
    passport.serializeUser(function(user, done) {
        done(null, user.id);
    });

    // used to deserialize the user
    passport.deserializeUser(function(id, done) {
        User.findById(id, function(err, user) {
            done(err, user);
        });
    });


    // =========================================================================
    // LOCAL SIGNUP ============================================================
    // =========================================================================
    // we are using named strategies since we have one for login and one for signup
    // by default, if there was no name, it would just be called 'local'

    passport.use('local-signup', new LocalStrategy({
        // by default, local strategy uses username and password, we will override with email
        usernameField : 'email',
        passwordField : 'password',
        passReqToCallback : true // allows us to pass back the entire request to the callback
    },
    function(req, email, password, done) {

        // asynchronous
        // User.findOne wont fire unless data is sent back
        process.nextTick(function() {

        // find a user whose email is the same as the forms email
        // we are checking to see if the user trying to login already exists
        User.findOne({ 'local.email' :  email }, function(err, user) {
            // if there are any errors, return the error
            if (err)
                return done(err);

            // check to see if theres already a user with that email
            if (user) {
                return done(null, false, req.flash('signupMessage', 'That email is already taken.'));
            } else {

                // if there is no user with that email create the user
                var newUser = new User();

                // set the user's local credentials
                newUser.local.email    = email;
                newUser.local.password = newUser.generateHash(password);

                // save the user
                newUser.save(function(err) {
                    if (err)
                        throw err;
                    return done(null, newUser);
                });
            }

        });

        });

    }));


    // =========================================================================
    // LTI SIGNUP ==============================================================
    // =========================================================================
    // Used to programatically login users to the game by validating an LTI Launch
    passport.use('lti-strategy', new LTIStrategy({
        consumerKey: 'sc-games',
        consumerSecret: 'loK2AjdvAz'
        // pass the req object to callback
        // passReqToCallback: true,
        // https://github.com/omsmith/ims-lti#nonce-stores
        // nonceStore: new RedisNonceStore('testconsumerkey', redisClient)
    }, function(lti, done) {

        // LTI launch parameters
        //console.dir(lti);

        var role = (lti.roles.length > 0) ? lti.roles[0] : '';
        role = role.toLowerCase();

        var user = {
            user_id     : lti.user_id,
            role        : role,
            name        : lti.lis_person_name_given,
            lastname    : lti.lis_person_name_family,
            email       : lti.lis_person_contact_email_primary
        }

        // Perform local authentication if necessary
        return done(null, user);

    }));

};
