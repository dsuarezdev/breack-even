// Load config
var configOauth = require('../../config/oauth.js')[process.env.NODE_ENV || 'development'];

// Load Helpers
var HubAPI = require('../helpers/hubapi');

var Simcase = require('../models/simcase');

module.exports = {

    // Find a SimCase
    find: function(req, res, next){

        var code = req.params.code;

        if( !code || code == 0 )
            return res.send('Missing code parameter.');

        Simcase.find({code: code}, function(err, simcase){

            if (err) return handleError(err);

            return res.json(simcase);
        });

    },

    sectionBySimcase: function( req, res, next ){
        // no funciona bien
        // debería poder listar las secciones de 1 simcase y opcionalmente filtradas por teacher
        console.log( "********* sectionBySimcase");
        var whereSimcase    = {};
        whereSimcase['simcases'] = configOauth.client_id;

        var teacher = req.params.teacher;
        if( !teacher || teacher == 0 )
            teacher = null;
        else
            whereSimcase['teacher'] = teacher;

        new HubAPI({
            api_url : configOauth.hub_url,
            token   : req.session.user.token
        }).getSections(whereSimcase, function(err, response, itemSections){

        console.log( "********* getSections");
            console.log(itemSections);
            if( err ) res.send( err );

            return res.json(itemSections);

        });
    }

};
