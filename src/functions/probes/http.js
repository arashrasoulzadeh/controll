const axios = require('axios');
const health = require('../health')
/**
 * http probe 
 * this probe will look for an http route to return expected status code,
 * then will broadcast the results to all websocket consumers
 */
const probe = function () {
    this.type = "http";
    this.args = [];
    this.check = function (server) {
        axios.get(this.args[0], {
                timeout: 100
            })
            .then(response => {
                if (response.status == this.expected) {
                    health.broadCastReadiness(true, server);
                } else {
                    health.broadCastReadiness(false, server);
                }

            })
            .catch(error => {
                health.broadCastReadiness(false, server);
            });
    }
}

module.exports.probe = probe