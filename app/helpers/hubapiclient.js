var request = require('request');

module.exports = function(o) {
  // *******************
  // ** GLOBAL OTIONS **
  // *******************

  var self = this;
  var options = o;

  // *************
  // *** UTILS ***
  // *************

  // Convert parameters object to url string
  this.paramsToUrl = function(params) {
    params = typeof params == 'object' ? params : {};
    var paramsStr = '';
    var idx = 0;
    for (var prop in params) {
      if (idx > 0) paramsStr = paramsStr + '&';
      else paramsStr = paramsStr + '?';

      paramsStr = paramsStr + prop + '=' + params[prop];
      ++idx;
    }

    return paramsStr;
  };

  // *************
  // ** METHODS **
  // *************

  // Perform 2-legged OAuth and get the token + refresh
  this.getToken = function(cb) {
    request(
      {
        url: options.hub_url + '/oauth/token',
        method: 'POST',
        auth: {
          user: options.client_id,
          pass: options.client_secret,
          sendImmediately: false
        },
        form: {
          grant_type: 'client_credentials',
          redirect_uri: options.redirect_uri
        }
      },
      function(error, response, body) {
        if (!error && response.statusCode == 200) {
          // Parse the response to JSON
          body = JSON.parse(body);

          // Get the ACCESS TOKEN
          var token = body.access_token;
          var refresh_token = body.refresh_token;

          options.client_token = token;
          options.refresh_token = refresh_token;

          if (!token) return cb({ error: 'Token not found' });
          else return cb(options);
        } else {
          return cb(error);
        }
      }
    );
  };

  // Perform 2-legged OAuth and get the token + refresh
  this.refreshToken = function(cb) {
    request(
      {
        url: options.hub_url + '/oauth/token',
        method: 'POST',
        auth: {
          user: options.client_id,
          pass: options.client_secret,
          sendImmediately: false
        },
        form: {
          grant_type: 'refresh_token',
          refresh_token: options.refresh_token
        }
      },
      function(error, response, body) {
        if (!error && response.statusCode == 200) {
          // Parse the response to JSON
          body = JSON.parse(body);

          if (typeof cb != 'undefined') return cb(null, response, body);
        } else {
          if (typeof cb != 'undefined') return cb(error, response, body);
        }
      }
    );
  };

  // Get HUB Sections
  this.getSections = function(params, cb) {
    // Convert object to URL data
    params = self.paramsToUrl(params);

    // Is there a token?
    if (!options.client_token) {
      console.info("No client_token, let's get a new one!");
      return self.getToken(function() {
        self.getSections(params, cb);
      });
    }

    // There's a client_token, let's proceed
    request(
      {
        url: options.hub_url + '/section' + params,
        method: 'GET',
        //form: params,
        auth: { bearer: options.client_token }
      },
      function(error, response, body) {
        if (!error && response.statusCode == 200) {
          // Parse the response to JSON
          body = JSON.parse(body);
          if (typeof cb != 'undefined') return cb(null, response, body);
        } else {
          // Unauthorized. Need to use refresh token?
          if (response.statusCode == 401) {
            console.log('Refresh token: ' + options.refresh_token);

            if (options.refresh_token) {
              self.refreshToken(function(e, r, b) {
                // Validate the error

                // Set the global options
                options.client_token = b.access_token;
                options.refresh_token = b.refresh_token;

                // Re-execute the current method
                self.getSections(params, cb);
              });
            }
          }

          // Success
          if (typeof cb != 'undefined') return cb(error, response, body);
        }
      }
    );
  };

  // Get HUB Users
  this.getUsers = function(params, cb) {
    // Convert object to URL data
    params = self.paramsToUrl(params);

    // Is there a token?
    if (!options.client_token) {
      console.info("No client_token, let's get a new one!");
      return self.getToken(function() {
        self.getUsers(params, cb);
      });
    }

    // There's a client_token, let's proceed
    request(
      {
        url: options.hub_url + '/user' + params,
        method: 'GET',
        auth: { bearer: options.client_token }
      },
      function(error, response, body) {
        // Success
        if (!error && response.statusCode == 200) {
          body = JSON.parse(body);
          if (typeof cb != 'undefined') return cb(null, response, body);

          // Error
        } else {
          // Unauthorized. Need to use refresh token?
          if (response.statusCode == 401) {
            console.log('Refresh token: ' + options.refresh_token);

            if (options.refresh_token) {
              self.refreshToken(function(e, r, b) {
                // Validate the error

                // Set the global options
                options.client_token = b.access_token;
                options.refresh_token = b.refresh_token;

                // Re-execute the current method
                self.getUsers(params, cb);
              });
            }
          }

          // Success
          if (typeof cb != 'undefined') return cb(error, response, body);
        }
      }
    );
  };

  // Send game event to the HUB
  this.gameEvent = function(params, cb) {
    params = typeof params == 'object' ? params : {};

    // Is there a token?
    if (!options.client_token) {
      console.info("No client_token, let's get a new one!");
      return self.getToken(function() {
        self.gameEvent(params, cb);
      });
    }

    // There's a client_token, let's proceed
    request(
      {
        url: options.hub_url + '/event',
        method: 'POST',
        form: params,
        auth: { bearer: options.client_token }
      },
      function(error, response, body) {
        // Validate the error
        console.log('gameEvent error: ');
        console.log(error);

        console.log('gameEvent body: ');
        console.log(body);

        // Success
        if (!error && response.statusCode == 200) {
          console.log('Event ' + params.event + ' successfully sent for ' + params.email);

          body = JSON.parse(body);
          if (typeof cb != 'undefined') return cb(null, response, body);

          // Error
        } else {
          // Unauthorized. Need to use refresh token?
          if (response.statusCode == 401) {
            console.log('Refresh token: ' + options.refresh_token);

            if (options.refresh_token) {
              self.refreshToken(function(e, r, b) {
                // Validate the error
                console.log('gameEvent e: ');
                console.log(e);

                console.log('gameEvent b: ');
                console.log(b);

                // Set the global options
                options.client_token = b.access_token;
                options.refresh_token = b.refresh_token;

                // Re-execute the current method
                self.gameEvent(params, cb);
              });
            }
          }

          // Other kind of Error
          if (typeof cb != 'undefined') return cb(error, response, body);
        }
      }
    );
  };

  // Init logic
  console.info('>>> HUBAPI: Initializing...');
  if (!options.client_token) {
    console.info('>>> HUBAPI: Authenticating client...');
    this.getToken(function() {
      console.log('>>> HUBAPI: New options.client_token: ' + options.client_token);
    });
  }

  return this;
};
