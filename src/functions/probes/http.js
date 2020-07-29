const axios = require('axios');
const health = require('../health')

const probe = function () {
    this.type = "http";
    this.args = [];
    this.server = null;
    this.check = function () {
        axios.get(this.args[0], {
                timeout: 100
            })
            .then(response => {
                if (response.status == this.expected) {
                    health.broadCastReadiness(true, this.server);
                } else {
                    health.broadCastReadiness(false, this.server);
                }

            })
            .catch(error => {
                health.broadCastReadiness(false, this.server);
            });
    }
}

module.exports.probe = probe