// Load models
var Result = require('../models/result');

// Load Helpers
var HubAPI = require('../helpers/hubapi');

module.exports = {

    // Demo
    index: function(req, res, next){

        // Get parameters
        // var code = req.params.code;

        // Validate parameters
        //if( !code || code == 0 )
        //    return res.send('Missing code parameter.');

        Simcase.find({code: code}, function(err, simcase){

            if (err) return handleError(err);

            return res.json(simcase);

        });

    },


    // Save result
    save: function(req, res, next){

        var newResult = new Result({
            user_id     : req.body.user_id,
            simcase_id  : req.body.simcase_id,
            result      : req.body.result,
        });

        newResult.save(function(err, result){
            newResult.updateUserStats( newResult.user_id, function(correctness){
                res.json( result );
            });
        });

    }

};
