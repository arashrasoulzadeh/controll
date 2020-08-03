const axios = require('axios');
const health = require('../health')
const ping = require('ping');

/**
 * ping probe 
 * this probe will ping a url or ip and expect a pong
 */
const probe = function () {
    this.ip = "127.0.0.1"
    this.check = function (server) {
        ip_to_check = this.ip
        ping.sys.probe(ip_to_check, function (isAlive, error) {
            health.broadCastReadiness(isAlive, server);
        });
    }
}

module.exports.probe = probe