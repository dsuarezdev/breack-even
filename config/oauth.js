var envConfig = {

    development: {
        site_url: 'http://localhost:8080',
        hub_url: 'http://localhost:1337',
        client_id: 'WUW7ZSW4IR',
        client_secret: 'YX6sWKURZDX4lGpnEsKSelvw2H3UMR',
        redirect_uri: 'http://localhost:8080/oauth_callback',
        scope: 'player'
    },

    heroku: {
        site_url: 'http://sc-optimization.herokuapp.com',
        hub_url: 'http://simcase-hub.herokuapp.com',
        client_id: '9NAY74T7FJ',
        client_secret: 'FMEtNhQNZSYi0w8s9xlRTuj1CTRQ5f',
        redirect_uri: 'http://sc-optimization.herokuapp.com/oauth_callback',
        scope: 'player'
    },

    production: {
        site_url: 'http://lab.simcase.io/apps/optimization',
        hub_url: 'http://lab.simcase.io/',
        client_id: '9NAY74T7FJ',
        client_secret: 'FMEtNhQNZSYi0w8s9xlRTuj1CTRQ5f',
        redirect_uri: 'http://lab.simcase.io/apps/optimization/oauth_callback',
        scope: 'player'
    }

};

module.exports = envConfig;
