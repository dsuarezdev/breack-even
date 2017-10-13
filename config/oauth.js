var envConfig = {

    development: {
        site_url: 'http://localhost:8080',
        hub_url: 'http://lab.simcase.io/',
        client_id: 'Z6JEQJ659M',
        client_secret: 'NReaaG9B0iRT5uawid2LJLstj2WRbB',
        redirect_uri: 'http://localhost:8080/oauth_callback',
        scope: 'player'
    },

    production: {
        site_url: 'http://lab.simcase.io/apps/baseapp',
        hub_url: 'http://lab.simcase.io/',
        client_id: '',
        client_secret: '',
        redirect_uri: 'http://lab.simcase.io/apps/baseapp/oauth_callback',
        scope: 'player'
    }

};

module.exports = envConfig;
