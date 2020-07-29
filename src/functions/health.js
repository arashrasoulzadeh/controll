const socketio = require('./socket')
const httpProbe = require('./probes/http')

function broadCastReadiness(status, server) {

    socketio.broadcast("readiness", {
        "server_id": server.id,
        "message": status
    })
}


function checkReadiness(server) {
    probe_config = server.health.readiness;
    switch (probe.type) {
        case "http":
            probe = new httpProbe.probe()
            probe.args = [probe_config.url]
            probe.server = server
            probe.expected = probe_config.expected
            probe.check();
    }
}

function addReadinessProbe(server) {
    probe = server.health.readiness;
    console.log("readiness probe registered:", server.name)

    func = setInterval(() => {
        job = checkReadiness(server);
    }, probe.per);

    // this.probes.readiness.push(func);
    // console.log(func);
}

module.exports.addReadinessProbe = addReadinessProbe
module.exports.broadCastReadiness = broadCastReadiness