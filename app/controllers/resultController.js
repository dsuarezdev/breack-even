// Load config
var configOauth = require('../../config/oauth.js')[process.env.NODE_ENV || 'development'];

// Load Helpers
var HubAPI = require('../helpers/hubapi');

// Load Helpers
var ReportHelper = require('../helpers/reports');

var User = require('../models/user');
var Simcase = require('../models/simcase');

var converter = require('json-2-csv');

module.exports = {


    /* List Class Per Simcase */
    listClassPerSimcase: function(req, res, next){

//        var params = req.params.all();
        var params = req.query;
//        console.log( "**********");
//        console.log( params );
//        console.log( "**********");

        var data = {};
        data.title  = "";
        data.module = "results";

        var where           = {};
        var whereSimcase    = {};
        var whereLevel      = {};
        var whereSection    = {};
        var whereUser       = {};
        var whereTeacher    = {};

        var boolSimcaseID   = false;
        var boolLevelID     = false;
        var boolSectionID   = false;
        var boolStudentID   = false;
        var boolTeacherID   = false;

        if( params.teacher && params.teacher != '' ) {
            data.teacher = params.teacher;
            boolTeacherID = true;
            whereTeacher['_id'] = data.teacher;
        }else{
            boolTeacherID = true;
            data.teacher = req.session.user.id;
            whereTeacher['_id'] = data.teacher;
        }
//        if( params.simcase_id && params.simcase_id != '' ) {
//            data.simcase_id = params.simcase_id;
//            whereSimcase['simcases'] = data.simcase_id;
            whereSimcase['simcases'] = configOauth.client_id;
            boolSimcaseID = true;
//        }
        if( params.level_id && params.level_id != '' ) {
            data.level_id = params.level_id;
            boolLevelID = true;
        }
        if( params.section_id && params.section_id != '' ) {
            data.section_id = params.section_id;
            boolSectionID = true;
        }
        if( params.student_id && params.student_id != '' ) {
            data.user_id = params.student_id;
            boolStudentID = true;
        }

        // encontrar el rol del usuario
//        console.log( whereTeacher );
        User.findOne( whereTeacher ).exec(function(err, itemUser){
//            console.log( itemUser );
//            console.log( "****> " + itemUser.role );
            if( itemUser.role == 'administrator' || itemUser.role == 'teacher'){
                boolTeacherID = false;
                // Si es admin, tiene acceso a todo
                if(itemUser.role == 'teacher'){
                    boolTeacherID           = true;
                    whereSimcase['teacher'] = data.teacher;
                    whereSection['teacher'] = data.teacher;
                }

                if( boolSimcaseID ){
                    var totalResults = [];

//                    where['simcase_id'] = data.simcase_id; // Ya no va, TODOs los result de esta DB, son del mismo SIMCASE
//                    console.log( whereSimcase );
                    // Find Students
//                    Section.find( whereSimcase ).populate('students').exec(function(err, itemSimcaseSection){
                    new HubAPI({
                        api_url : configOauth.hub_url,
                        token   : req.session.user.token
                    }).getSections(whereSimcase, function(err, response, itemSimcaseSection){

                        if( err ) res.send( err );

//                        console.log( itemSimcaseSection );

                        if( itemSimcaseSection.length == 0 ){
                            res.send( {msg: 'No Sections', status: 402, wh: whereSimcase } );
                        }

                        var myStudents = [];
                        var lastSection = false;
                        itemSimcaseSection.forEach( function( resSimcase, itemIdx ){
                            if( (itemIdx + 1) == itemSimcaseSection.length)
                                lastSection = true;

                            var lastRes = false;

                            resSimcase.students.forEach( function( resStudent, idx) {
                                myStudents.push( resStudent.id );

                                if( (idx + 1) == resSimcase.students.length )
                                    lastRes = true;

//                                console.log( itemIdx + ' / ' + itemSimcaseSection.length + ' = ' + lastSection + ' *** ' + idx + ' / ' + resSimcase.students.length + ' = ' + lastRes)

                                if( lastSection && lastRes ){

//                                    console.log('<===== Simcase =====>');
//                                    console.log( myStudents );
//                                    console.log('<===========>');

                                    where['user_id'] =  { $in: myStudents};
                                    new ReportHelper({}).report( req, res, where, function(results){
//                                        console.log( results );

                                        totalResults = totalResults.concat(results);

                                        if( boolLevelID ){
//                                            console.log( "------ levelID -------" );
                                            where['result.level.id']        = data.level_id;
                                            // Find Students
//                                            Section.find( whereSimcase ).populate('students').exec(function(err, itemSimcaseSection){
                                            new HubAPI({
                                                api_url : configOauth.hub_url,
                                                token   : req.session.user.token
                                            }).getSections(whereSimcase, function(err, response, itemSimcaseSection){
//                                                console.log( itemSimcaseSection );
                                                var myStudents = [];
                                                var lastSection = false;
                                                itemSimcaseSection.forEach( function( resSimcase , itemIdx ){
                                                    if( (itemIdx + 1) == itemSimcaseSection.length)
                                                        lastSection = true;

                                                    var lastRes = false;

                                                    resSimcase.students.forEach( function( resStudent, idx) {
                                                        myStudents.push( resStudent.id );
                                                        if( (idx + 1) == resSimcase.students.length )
                                                            lastRes = true;

                                                        if( lastSection && lastRes ){

//                                                            console.log('<===== Simcase Lvl =====>');
//                                                            console.log( myStudents );
//                                                            console.log('<===========>');

                                                            where['user_id'] =  { $in: myStudents};
                                                            new ReportHelper({}).report( req, res, where, function(resultsLv){
                        //                                        console.log( resultsLv );

                                                                totalResults = totalResults.concat(resultsLv);

//                                        res.send( totalResults );

                                                                if( boolSectionID ){
//                                                                    console.log( "------ SectionID -------" );
                                                                    whereSection['id']      = data.section_id;

//                                                                    Section.findOne( whereSection ).populate('students').exec(function(err, itemSection){
                                                                    new HubAPI({
                                                                        api_url : configOauth.hub_url,
                                                                        token   : req.session.user.token
                                                                    }).getSections( whereSection, function(err, response, itemSection){
//                                                                        console.log(itemsSection);

                                                                        var myStudents = [];
                                                                        var lastSection = false;
                                                                        itemSection.students.forEach( function( resStudent, idx) {
                                                                            myStudents.push( resStudent.id );

                                                                            if( (idx + 1) == itemSection.students.length)
                                                                                lastSection = true;

                                                                            if( lastSection ){

//                                                                                console.log('<===========>');
//                                                                                console.log( myStudents );
//                                                                                console.log('<===========>');

                                                                                where['user_id'] =  { $in: myStudents};

                                                                                new ReportHelper({}).report( req, res, where, function(resultsSec){
                                //                                                    console.log( resultsSec );

                                                                                    totalResults = totalResults.concat(resultsSec);

                                                                                    if( boolStudentID ){
//                                                                                        console.log( "------ StudentID -------" );
                                                                                        where['user_id'] = data.user_id;
                                                                                        new ReportHelper({}).report( req, res, where, function(resultsStudent){
                                //                                                            console.log( resultsStudent );

                                                                                            totalResults = totalResults.concat(resultsStudent);

                                                                                            res.send( totalResults );

                                                                                        });

                                                                                    }else{
                                                                                        res.send( totalResults );
                                                                                    }
                                                                                });
                                                                            } // last section
                                                                        });


                                                                    });

                                                                }else{
                                                                    res.send( totalResults );
                                                                }
                                                            });

                                                        } // last item
                                                    });
                                                });

                                            });

                                        }else{
                                            res.send( totalResults );
                                        }

                                    } );
                                } // last item
                            });
                        });

                    });

                }
            }else{
                var msg = {msg: 'Not authorized', status: 400};
                res.send(msg);
            }


        });

    },

    listParticipation: function(req, res, next){
//        var params = req.params.all();
        var params = req.query;
//        console.log( "**********");
//        console.log( params );
//        console.log( "**********");

        var data = {};
        data.title  = "";
        data.module = "results";

        // Set parametros para filtrar
        /*
        */
        var where           = {};
        var whereResult     = {};
        var whereSimcase    = {};
        var whereLevel      = {};
        var whereSection    = {};
        var whereUser       = {};
        var whereTeacher    = {};

        var boolSimcaseID   = false;
        var boolLevelID     = false;
        var boolSectionID   = false;
        var boolStudentID   = false;
        var boolTeacherID   = false;

        if( params.teacher && params.teacher != '' ) {
            data.teacher = params.teacher;
            boolTeacherID = true;
            whereTeacher['_id'] = data.teacher;
        }else{
            boolTeacherID = true;
            data.teacher = req.session.user.id;
            whereTeacher['_id'] = data.teacher;
        }
//        if( params.simcase_id && params.simcase_id != '' ) {
            data.simcase_id = configOauth.client_id;
            whereSimcase['simcases'] = data.simcase_id;
            whereSection['simcases'] = data.simcase_id;
            boolSimcaseID = true;
//        }
        if( params.level_id && params.level_id != '' ) {
            data.level_id = params.level_id;
            boolLevelID = true;
        }
        if( params.section_id && params.section_id != '' ) {
            data.section_id = params.section_id;
            boolSectionID = true;
        }
        if( params.student_id && params.student_id != '' ) {
            data.user_id = params.student_id;
            boolStudentID = true;
        }

        // encontrar el rol del usuario
        User.findOne( whereTeacher ).exec(function(err, itemUser){
//            console.log( itemUser );
            if( itemUser.role == 'administrator' || itemUser.role == 'teacher'){
                boolTeacherID = false;
                // Si es admin, tiene acceso a todo
                if(itemUser.role == 'teacher'){
                    boolTeacherID           = true;
                    whereSimcase['teacher'] = data.teacher;
                    whereSection['teacher'] = data.teacher;
                }

                if( boolSimcaseID ){
//                    console.log( "------ SimcaseID -------" );
//                    console.log( whereSimcase);
                    var totalResults = [];

//                    where['simcase_id']         = User.mongo.objectId(data.simcase_id);
//                    whereResult['simcase_id']   = (data.simcase_id); // TODOS son del mismo simcase
                    // Find Students
//                    Section.find( whereSimcase ).populate('students').exec(function(err, itemSimcaseSection){
                    new HubAPI({
                        api_url : configOauth.hub_url,
                        token   : req.session.user.token
                    }).getSections( whereSimcase, function(err, response, itemSimcaseSection){
//                        console.log( itemSimcaseSection );
                        var myStudents = [];
                        itemSimcaseSection.forEach( function( resSimcase ){
                            resSimcase.students.forEach( function( res, idx) {
                                if( myStudents.indexOf((res.id)) == -1 )
                                    myStudents.push( (res.id) );
                            });
                        });

//                        console.log('<===== Simcase =====>');
//                        console.log( myStudents );
//                        console.log('<===========>');

//                        whereResult['user_id']  =  myStudents;
                        whereResult['user_id'] =  { $in: myStudents};
                        new ReportHelper({}).reportParticipation( req, res, whereSection, whereResult, null, function(results){
//                            console.log( results );

                            totalResults = totalResults.concat(results);
//                            res.send( totalResults );

                            if( boolLevelID ){
//                                console.log( "------ LevelID -------" );
//                                where['result.level.id']        = data.level_id;
                                whereResult['result.level.id']        = data.level_id;
                                // Find Students
//                                Section.find( whereSimcase ).populate('students').exec(function(err, itemSimcaseSection){
                                new HubAPI({
                                    api_url : configOauth.hub_url,
                                    token   : req.session.user.token
                                }).getSections( whereSimcase, function(err, response, itemSimcaseSection){
                                    console.log( itemSimcaseSection );
                                    var myStudents = [];
                                    itemSimcaseSection.forEach( function( resSimcase ){
                                        resSimcase.students.forEach( function( res, idx) {
                                            if( myStudents.indexOf( (res.id)) == -1 )
                                                myStudents.push(  (res.id) );
                                        });
                                    });

//                                    console.log('<===== Simcase =====>');
//                                    console.log( myStudents );
//                                    console.log('<===========>');

//                                    whereResult['user_id']  =  myStudents;
                                    whereResult['user_id'] =  { $in: myStudents};
                                    new ReportHelper({}).reportParticipation( req, res, whereSection, whereResult, null, function(resultsLv){
//                                        console.log( resultsLv );

                                        totalResults = totalResults.concat(resultsLv);

                                        if( boolSectionID ){
//                                            console.log( "------ SectionID -------" );
                                            whereSection['id']      = data.section_id;

                                            if( boolTeacherID ){
//                                                console.log( "------ TeacherID -------" );
                                                whereSection['teacher'] = data.teacher;
                                            }

//                                            Section.findOne( whereSection ).populate('students').exec(function(err, itemSection){
                                            new HubAPI({
                                                api_url : configOauth.hub_url,
                                                token   : req.session.user.token
                                            }).getSections( whereSection, function(err, response, itemSection){
                                                var myStudents = [];

                                                itemSection.students.forEach( function( res, idx) {
                                                    if( myStudents.indexOf( (res.id)) == -1 )
                                                        myStudents.push(  (res.id) );
                                                });

//                                                console.log('<===========>');
//                                                console.log( myStudents );
//                                                console.log('<===========>');

//                                                whereResult['user_id']  =  myStudents;
                                                whereResult['user_id'] =  { $in: myStudents};

                                                new ReportHelper({}).reportParticipation( req, res, whereSection, whereResult, null, function(resultsSec){
//                                                    console.log( resultsSec );

                                                    totalResults = totalResults.concat(resultsSec);

                                                    if( boolStudentID ){
//                                                        where['user_id']        = [User.mongo.objectId(data.user_id)];
                                                        whereResult['user_id']  = [(data.user_id)];
                                                        new ReportHelper({}).reportParticipation( req, res, whereSection, whereResult, data.user_id, function(resultsStudent){
//                                                            console.log( resultsStudent );

                                                            totalResults = totalResults.concat(resultsStudent);

                                                            res.send( totalResults );

                                                        });

                                                    }else{
                                                        res.send( totalResults );
                                                    }
                                                });

                                            });

                                        }else{
                                            res.send( totalResults );
                                        }
                                    });
                                });

                            }else{
                                res.send( totalResults );
                            }

                        } );
                    });

                }
            }else{
                var msg = {msg: 'Not authorized', status: 400};
                res.send(msg);
            }


        });

    },

    downloadCSV: function( req, res, next ){

        var data = {};
        data.title  = "";
        data.module = "results";

        var where           = {};
        var whereSimcase    = {};
        var whereLevel      = {};
        var whereSection    = {};
        var whereUser       = {};
        var whereTeacher    = {};

        if( req.param('teacher') && req.param('teacher') != '' ) {
            data.teacher = req.param('teacher');
            boolTeacherID = true;
            whereTeacher['_id'] = data.teacher;
        }else{
            boolTeacherID = true;
            data.teacher = req.session.user.id;
            whereTeacher['_id'] = data.teacher;
        }

//        if( params.simcase_id && params.simcase_id != '' ) {
//            data.simcase_id = params.simcase_id;
//            whereSimcase['simcases'] = data.simcase_id;
            whereSimcase['simcases'] = configOauth.client_id;
            boolSimcaseID = true;
//        }

        if( boolTeacherID ){
//            var where = { simcase_id:  data.simcase_id };

            // encontrar el rol del usuario
            User.findOne( whereTeacher ).exec(function(err, itemUser){
    //            console.log( itemUser );
                if( itemUser.role == 'administrator' || itemUser.role == 'teacher'){
                    // Si es admin, tiene acceso a todo
                    if(itemUser.role == 'teacher'){
                        whereSimcase['teacher'] = data.teacher;
                        whereSection['teacher'] = data.teacher;
                    }

                    if( boolSimcaseID ){
//                        console.log( "------ SimcaseID -------" );
                        var totalResults = [];

                        console.log( whereSimcase );
                        // Find Students
    //                    Section.find( whereSimcase ).populate('students').exec(function(err, itemSimcaseSection){
                        new HubAPI({
                            api_url : configOauth.hub_url,
                            token   : req.session.user.token
                        }).getSections( whereSimcase, function(err, response, itemSimcaseSection){
    //                        console.log( itemSimcaseSection );
                            var myStudents = [];
                            itemSimcaseSection.forEach( function( resSimcase ){
                                resSimcase.students.forEach( function( res, idx) {
                                    myStudents.push( res.id );
                                });
                            });

    //                        console.log('<===== Simcase =====>');
    //                        console.log( myStudents );
    //                        console.log('<===========>');

                            where['user_id'] =  { $in: myStudents};

                            new ReportHelper({}).downloadCSV( req, res, where,
                                function(results){
                                    console.log( results.length );

                                    // loopear los results y completar datos faltantes

                                    converter.json2csv(results, function(err, csv){
                                        console.log( "entró CSV");
                                        if (err)
                                            console.log( err );
                                            //throw err;

                                        console.log(csv);
                                        //res.send(csv);
                                        var filename = "report.csv";
                                        //var filename = "report-" + moment().format("YYYY-MM-DD") + ".csv";
                                        res.attachment(filename);
                                        res.end(csv, 'UTF-8');

                                    });
                                    //res.view('admin/results/class/list', { items: results, data: data });
                                    //res.send(results);
                                }
                            );

                        });

                    }
                }else{
                    var msg = {msg: 'Not authorized', status: 400}; // no role
                    res.send(msg);
                }

            });
        }else{
            var msg = {msg: 'Not authorized', status: 401}; // no teacher ID
            res.send(msg);
        }

    }
};
