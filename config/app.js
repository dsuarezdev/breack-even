var envConfig = {

    development: {
        name: 'BaseApp',
        port: 8080,
        io_domain: 'http://localhost:8080',
        io_path: '/socket.io'
    },

    testing: {
        name: 'BaseApp',
        port: 8080,
        io_domain: '',
        io_path: '/socket.io'
    },

    production: {
        name: 'BaseApp',
        port: 8888,
        io_domain: 'http://lab.simcase.io',
        io_path: '/apps/baseapp/socket.io'
    }

};

module.exports = envConfig;
