var Scenario = require('../models/scenario');

module.exports = {

    // Find a SimCase
    find: function(req, res, next){

        var name = req.params.name;

        if( !name || name == 0 )
            return res.send('Missing code parameter.');

        Scenario.find({name: name}, function(err, scenario){

            if (err) return handleError(err);

            return res.json(scenario);
        });

    }


};
