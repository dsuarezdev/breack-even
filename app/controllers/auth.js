// Load Modules
var request = require('request');

// Load Models
var User = require('../models/user');

// Load Helpers
var HubAPI = require('../helpers/hubapi');

// Load config
var configOauth = require('../../config/oauth.js')[process.env.NODE_ENV || 'development'];
var configApp = require('../../config/app.js')[process.env.NODE_ENV || 'development'];

module.exports = {

    // OAUTH DATA
    oauth_provider: function(req, res, next) {

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
    oauth_callback: function(req, res, next) {

        var code = req.query.code;
        if( !code )
            return res.send('Code missing.');

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

                if( !token )
                    res.error('Token not found');

                // Initialize the API Helper and try to get the user data
                new HubAPI({
                    api_url : configOauth.hub_url,
                    token   : token
                }).me(function(err, response, body){

                    // Insert or Update the user on the local db
                    User.update({_id: body.id}, {
                        api_id  : body.id,
                        email   : body.email,
                        token   : token,
                        role    : body.role,
                        name    : body.name,
                        lastname: body.lastname
                    }, {upsert: true, setDefaultsOnInsert: true}, function(dberr, upserted){

                        // Login the user and add his token to the session
                        req.session.user = body;
                        req.session.user.token = token;

                        // Redirect the user
                        if( req.session.user.role == 'administrator' )
                            res.redirect('dashboard');
                        else
                            res.redirect('play');

                    });

                });

            }else{
                res.json(response);
            }

        });

    },


    // OAUTH CALLBACK
    me: function(req, res, next) {

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


    // LOGOUT
    logout: function(req, res, next) {
        req.session.destroy();
        res.redirect(configOauth.site_url);
    }

};
