var request = require('request');
//request.debug = true;

var configOauth = require('../../config/oauth.js')[process.env.NODE_ENV || 'development'];

module.exports = HubAPI;

function HubAPI( options ){

    this.api_url        = options.api_url;
    this.token          = options.token;
    this.refresh_token  = options.refresh_token;

}


/* Request new token using the refresh token */
HubAPI.prototype.refresh = function( cb ){

    request({
        url: this.api_url + '/oauth/token',
        method: 'GET',
        auth: {
            user: configOauth.client_id,
            pass: configOauth.client_secret,
            sendImmediately: false
          },
        form: {
            grant_type: 'refresh_token',
            refresh_token: this.refresh_token
        }
    }, function (error, response, body) {

        console.log('Refresh Token Body');
        console.log(body);

        if (!error && response.statusCode == 200) {

            // Parse the response to JSON
            body = JSON.parse(body);

            if( typeof cb != 'undefined' )
                return cb( null, response, body );

        }else{

            if( typeof cb != 'undefined' )
                return cb( error, response, body );

        }

    });

};


/* Get current user information */
HubAPI.prototype.me = function( cb ){

    request({
        url: this.api_url + '/me',
        method: 'GET',
        auth: { bearer: this.token}
    }, function (error, response, body) {

        if (!error && response.statusCode == 200) {

            // Parse the response to JSON
            body = JSON.parse(body);

            if( typeof cb != 'undefined' )
                return cb( null, response, body );

        }else{

            // Unauthorized. Need to use refresh token?
            if( response.statusCode == 401 ){

                console.log('Refresh token: ' + this.refresh_token);
                console.log(refreshToken);

            }

            if( typeof cb != 'undefined' )
                return cb( error, response, body );

        }

    });

};

// Get sections
HubAPI.prototype.getSections = function( params, cb ){

    params = (typeof params == 'object') ? params : {};
//console.log( '***** PARAMS ******' );
//    console.log(params);
    var paramsStr = '';
    var indice = 0;
    for (var prop in params){
        if( indice > 0 )
            paramsStr = paramsStr + '&';
        else
            paramsStr = paramsStr + '?';

        paramsStr = paramsStr + prop + '=' + params[prop];

        ++indice;
    }

    console.log(this.api_url);

    request({
        url: this.api_url + '/section' + paramsStr,
        method: 'GET',
        //form: params,
        auth: { bearer: this.token}
    }, function (error, response, body) {

        if (!error && response.statusCode == 200) {

            // Parse the response to JSON
            body = JSON.parse(body);
            if( typeof cb != 'undefined' )
                return cb( null, response, body );

        }else{

            if( typeof cb != 'undefined' )
                return cb( error, response, body );

        }

    });

};
