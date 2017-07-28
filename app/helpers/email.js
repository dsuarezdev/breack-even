var Mailgun = require('mailgun-js');

//Your api key, from Mailgun’s Control Panel
var api_key = 'key-c77dd194faea3218576c0265143f6aa1';
var domain = 'simcase.io';
var from_who = 'SimCase <hello@simcase.io>';

module.exports = {

    inviteToGame: function( user, magiclink, subject, appname ){

        //We pass the api_key and domain to the wrapper, or it won't be able to identify + send emails
        var mailgun = new Mailgun({apiKey: api_key, domain: domain});

        user.token = ( typeof user.token == 'undefined' ) ? '' : user.token;
        appname = (typeof appname == 'undefined' || appname.length == 0) ? '' : appname;

        // HTML Message
        var html = '<p>Hello ' + user.email + ',</p>';
        html    += '<p>You’ve been invited to ' + appname + '. Click on the following link to enter the game:</p>';
        html    += '<p><a href="' + magiclink + '">' + magiclink + '</a></p>';
        html    += '<p>Engage and Enjoy,</p>';
        html    += '<p>SimCase</p>';

        var data = {
            from: from_who,
            to: user.email,
            subject: subject,
            html: html
        };

        // Send the email
        mailgun.messages().send(data, function (err, body) {

            if( err ){
                console.log("Got an error: ", err);
                return false;
            }else{
                console.log(body);
                return true;
            }

        });

    },

    shareEmail: function(data){

        //We pass the api_key and domain to the wrapper, or it won't be able to identify + send emails
        var mailgun = new Mailgun({apiKey: api_key, domain: domain});

        var email = data.email;
        var link  = data.link;
        var subject  = (typeof data.subject == 'undefined') ? 'Your SimCase Invitation' : data.subject;
        var appname  = (typeof data.appname == 'undefined' || data.appname.length == 0) ? '' : data.appname;

        if( !email || email.length == 0)
            return false;

        if( !link || link.length == 0)
            return false;

        // HTML Message
        var html = '<p>Hello ' + email + ',</p>';
        html    += '<p>You’ve been invited to ' + appname +  '. Click on the following link to enter the game:</p>';
        html    += '<p><a href="' + link + '">' + link + '</a></p>';
        html    += '<p>Engage and Enjoy,</p>';
        html    += '<p>SimCase</p>';

        var data = {
            from: from_who,
            to: email,
            subject: subject,
            html: html
        };

        // Send the email
        return mailgun.messages().send(data, function (err, body) {

            if( err ){
                console.log("Mailgin:: Got an error: ", err);
                return false;
            }else{
                console.log(body);
                return true;
            }

        });

    }

}
