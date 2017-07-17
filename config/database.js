var envConfig = {

    development: {
        url: 'mongodb://localhost:27017/sc-baseapp'
    },

    heroku: {
        url: ''
    },

    production: {
        url: ''
    }
};

module.exports = envConfig;
