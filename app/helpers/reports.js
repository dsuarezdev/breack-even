// Load config
var configOauth = require('../../config/oauth.js')[process.env.NODE_ENV || 'development'];

var HubAPI = require('../helpers/hubapi');

var Simcase = require('../models/simcase');
var Result = require('../models/result');

var _factor = 1000;

function Report( options ){
    this.options = options;
}

module.exports = Report;

    // Demo method
Report.prototype.method_name= function(param1, param2, param3){

    Simcase.find({}, function(err, simcases){

        return [param1, param2, param3, simcases];

    });

};

Report.prototype.report= function( req, res, wh, cb ){

    var rightSelection    = 0;
    var rightCalculation  = 0;
    var wrongCalculation  = 0;
    var correctness       = 0;
    var correctness_sel   = 0;
    var correctness_calc  = 0;

    var resultSize        = 0;
    var revenue           = 0;

    var global_revenue           = 0;
    var global_correctness       = 0;
    var global_correctness_sel   = 0;
    var global_correctness_calc  = 0;
//console.log('+++++ report where ++++++');
//console.log(wh);
//console.log('+++++++++++');
    Result.find( wh ).populate('simcase_id').exec(function (err, theResults) {
//        console.log( theResults );
        if (err)
            return cb(err);

        if (!theResults)
            return cb(new Error('Not results.'));

        // recorrer los results y calcular las stats
        resultSize = theResults.length;
//        console.log( "#Result: " + resultSize );

        var myResults = {};

        theResults.forEach( function( res, idx) { // recorrer los results encontrados
//        for( var idx = 0; idx < theResults.length; idx++) { // recorrer los results encontrados
//            var res = theResults[idx];
//            console.log(idx);
//            console.log(res);

            // Contar las correctas
            if( res.result.items[res.result.selectedItem].correct == "true" ){
                rightSelection = rightSelection + 1;
            }

            for ( var i in res.result.calculations ){
                if( res.result.calculations[i] && res.result.calculations[i].correct == "true" ){
                    rightCalculation = rightCalculation + 1;
                }else{
                    wrongCalculation = wrongCalculation + 1;
                }
            }

            correctness_sel     = rightSelection/resultSize;
            correctness_sel     = Math.floor( correctness_sel * _factor )/_factor;
            correctness_calc    = rightCalculation/(rightCalculation + wrongCalculation);
            correctness_calc    = Math.floor( correctness_calc * _factor )/_factor;
            correctness         = (rightSelection + rightCalculation)/(resultSize + rightCalculation + wrongCalculation);
            correctness         = Math.floor( correctness * _factor )/_factor;

//                console.log( correctness );
//                console.log( correctness_calc );
//                console.log( correctness_sel );

            theResults[idx].final_revenue            = (typeof res.result.finalRevenue == 'undefined') ? 0 : res.result.finalRevenue;
            theResults[idx].correctness              = correctness;
            theResults[idx].correctness_calculation  = correctness_calc;
            theResults[idx].correctness_selection    = correctness_sel;

            // Add to myResults
            myResults.simcase_id                = res.simcase_id.id;
            myResults.simcase_name              = res.simcase_id.name;
            myResults.scenario_id               = res.result.scenario.id;
            myResults.scenario_name             = res.result.scenario.name;

            // FinalRevenue
            //global_revenue          += revenue;
            if( typeof res.result.finalRevenue != 'undefined' )
                global_revenue += parseFloat(res.result.finalRevenue);

            global_correctness      += correctness;
            global_correctness_calc += correctness_calc;
            global_correctness_sel  += correctness_sel;

        });

//        console.log( "Correctness: " + global_correctness );
//        console.log( "Correctness Calc: " + global_correctness_calc );
//        console.log( "Correctness Sel: " + global_correctness_sel );
        if( resultSize > 0 ){
            global_correctness      = global_correctness/resultSize;
            global_correctness      = Math.floor( global_correctness * _factor )/_factor;
            global_correctness_calc = global_correctness_calc/resultSize;
            global_correctness_calc = Math.floor( global_correctness_calc * _factor )/_factor;
            global_correctness_sel  = global_correctness_sel/resultSize;
            global_correctness_sel  = Math.floor( global_correctness_sel * _factor )/_factor;
        }

        myResults.final_revenue             = global_revenue;
        myResults.correctness               = global_correctness;
        myResults.correctness_calculation   = global_correctness_calc;
        myResults.correctness_selection     = global_correctness_sel;
        myResults.replays                   = resultSize;

//        console.log( "Revenue: " + global_revenue );
//        console.log( "Correctness: " + global_correctness );
//        console.log( "Correctness Calc: " + global_correctness_calc );
//        console.log( "Correctness Sel: " + global_correctness_sel );

        cb( myResults ) ;

    });
};

Report.prototype.reportParticipation= function( req, res, whereSection, whereResult, student, cb ){

//console.log('+++++ report whereSection ++++++');
//console.log(whereSection);
//console.log('+++++++++++');
//
//console.log('----- report whereResult -----');
//console.log(whereResult);
//console.log('----------');

    var totalParticipants = 0;
//    Section.find( whereSection )
//            .populate('students')
//            .exec(function(err, items){
    new HubAPI({
        api_url : configOauth.hub_url,
        token   : req.session.user.token
    }).getSections(whereSection, function(err, response, items){
            // Error
            if(err) return next(err);

            if( items.constructor === Array ){ // Si es un Array
                // Ok
                console.log(items);
                items.forEach( function( res, idx) {
                    //console.log( res );
                    var numParticipants = res.students.length;
                    console.log( "SectionID: " + res.id + " -> " + numParticipants );

                    totalParticipants += (student) ? 1 : numParticipants;

                    if( (idx + 1) == items.length ){

                        console.log( "total: " + totalParticipants );

                        Result.find( whereResult ).distinct( 'user_id', function(err, results ){
                            if( err ) return next(err);

                            console.log( "Jugones: " + results.length );
                            var porcentageParticipations = Math.floor((results.length/totalParticipants)*_factor)/_factor;
                            console.log( "Participación: " + porcentageParticipations );
                            console.log( "% de participación: " + porcentageParticipations*100 );

                            var res = {total: totalParticipants, players: results.length, participation: porcentageParticipations, porcentage: porcentageParticipations*100 };
                            cb( res ) ;
                        })
                    }
                });

            }else{  // Si es un obejct
                var res = items;
                var numParticipants = res.students.length;
                console.log( "SectionID: " + res.id + " -> " + numParticipants );

                totalParticipants += (student) ? 1 : numParticipants;

                console.log( "total: " + totalParticipants );

                Result.find( whereResult ).distinct( 'user_id', function(err, results ){
                    if( err ) return next(err);

                    console.log( "Jugones: " + results.length );
                    var porcentageParticipations = Math.floor((results.length/totalParticipants)*_factor)/_factor;
                    console.log( "Participación: " + porcentageParticipations );
                    console.log( "% de participación: " + porcentageParticipations*100 );

                    var res = {total: totalParticipants, players: results.length, participation: porcentageParticipations, porcentage: porcentageParticipations*100 };
                    cb( res ) ;
                })

            }

    });

};

Report.prototype.downloadCSV= function( req, response, whereResults, cb ){

    var rightSelection    = 0;
    var rightCalculation  = 0;
    var wrongCalculation  = 0;
    var correctness       = 0;
    var correctness_sel   = 0;
    var correctness_calc  = 0;

    var resultSize        = 0;
    var revenue           = 0;

    var global_revenue           = 0;
    var global_correctness       = 0;
    var global_correctness_sel   = 0;
    var global_correctness_calc  = 0;
//console.log('+++++ downloadCSV where ++++++');
//console.log(whereResults);
//console.log('+++++++++++');
    Result.find( whereResults ).populate('user_id').populate('simcase_id').exec(function (err, theResults) {
//        console.log( theResults );
        if (err)
            return cb(err);

        if (!theResults)
            return cb(new Error('Not results.'));

        // recorrer los results y calcular las stats
        resultSize = theResults.length;
        console.log( "#Result: " + theResults.length );

        var myResults = [];

        theResults.forEach( function( res, idx) { // recorrer los results encontrados
//            console.log(res);

            // Contar las correctas
            if( res.result.items[res.result.selectedItem].correct == "true" ){
                rightSelection = rightSelection + 1;
            }

            for ( var i in res.result.calculations ){
                if( res.result.calculations[i] && res.result.calculations[i].correct == "true" ){
                    rightCalculation = rightCalculation + 1;
                }else{
                    wrongCalculation = wrongCalculation + 1;
                }
            }

            correctness_sel     = rightSelection/resultSize;
            correctness_sel     = Math.floor( correctness_sel * _factor )/_factor;
            correctness_calc    = rightCalculation/(rightCalculation + wrongCalculation);
            correctness_calc    = Math.floor( correctness_calc * _factor )/_factor;
            correctness         = (rightSelection + rightCalculation)/(resultSize + rightCalculation + wrongCalculation);
            correctness         = Math.floor( correctness * _factor )/_factor;

//                console.log( correctness_sel );
//                console.log( correctness_calc );
//                console.log( correctness );

            theResults[idx].final_revenue            = (typeof res.result.finalRevenue == 'undefined') ? 0 : res.result.finalRevenue;
            theResults[idx].correctness              = correctness;
            theResults[idx].correctness_calculation  = correctness_calc;
            theResults[idx].correctness_selection    = correctness_sel;

            // Add to myResults
            myResults[idx] = {};
            myResults[idx].user_id                   = res.user_id.id;
            myResults[idx].user_name                 = res.user_id.name;
            myResults[idx].user_lastName             = res.user_id.lastname;
            myResults[idx].simcase_id                = res.simcase_id.id;
            myResults[idx].simcase_name              = res.simcase_id.name;
            myResults[idx].scenario_id               = res.result.scenario.id;
            myResults[idx].scenario_name             = res.result.scenario.name;
            myResults[idx].level_id                  = res.result.level.id;
            myResults[idx].level_name                = res.result.level.name;
            myResults[idx].final_revenue             = (typeof res.result.finalRevenue == 'undefined') ? 0 : res.result.finalRevenue;
            myResults[idx].correctness               = correctness;
            myResults[idx].correctness_calculation   = correctness_calc;
            myResults[idx].correctness_selection     = correctness_sel;


        } );

        cb( myResults ) ;

    });
};

