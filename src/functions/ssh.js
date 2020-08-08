var Client = require('ssh2').Client;

function tunnel(config) {
    var client = new Client();
    client.connect(config);
    return client;
}

module.exports.tunnel = tunnel