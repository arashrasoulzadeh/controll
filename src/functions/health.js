const socketio = require('./socket')
const httpProbe = require('./probes/http')
const pingProbe = require('./probes/ping')

/**
 * broadcast server readiness status to all websocket subscribers
 * @param {string} status 
 * @param {object} server 
 */
function broadCastReadiness(status, server) {
    socketio.broadcast("readiness", {
        "server_id": server.id,
        "message": status
    })
}

/**
 * check a probe of server
 * @param {object} type 
 * @param {object} server 
 */
function checkProbe(type, server) {
    if (type == "readiness") {
        probe_config = server.health.readiness;
    } else if (type == "liveness") {
        probe_config = server.health.liveness;
    } else {
        throw "invalid probe type " + type;
    }

    if (probe_config.type == "http") {
        probe = new httpProbe.probe()
        probe.args = [probe_config.url]
        probe.expected = probe_config.expected
        probe.check(server);
    } else if (probe_config.type == "ping") {
        probe = new pingProbe.probe()
        probe.ip = probe_config.ip;
        probe.check(server);
    } else {
        throw ("unknown probe type " + probe.type)
    }
}


/**
 * add readiness monitor for a server   
 * @param {object} server 
 */
function addReadinessProbe(server) {
    console.log("readiness probe registered:", server.name)

    func = setInterval(() => {
        job = checkProbe("readiness", server);
    }, server.health.readiness.per);

}

/**
 * add liveness monitor for a server   
 * @param {object} server 
 */
function addLivenessProbe(server) {
    console.log("liveness probe registered:", server.name)

    func = setInterval(() => {
        job = checkProbe("liveness", server);
    }, server.health.liveness.per);

}

module.exports.addReadinessProbe = addReadinessProbe
module.exports.addLivenessProbe = addLivenessProbe
module.exports.broadCastReadiness = broadCastReadiness