const axios = require('axios');
const socketio = require('./socket')

function broadCastReadiness(status, server) {

    socketio.broadcast("readiness", {
        "type": "not_ready",
        "server_id": server.id,
        "message": status
    })
}


function checkReadiness(server) {
    probe = server.health.readiness;
    switch (probe.type) {
        case "http":
            axios.get(probe.url)
                .then(response => {
                    if (response.status = probe.expected) {
                        broadCastReadiness(true, server);

                    } else {
                        broadCastReadiness(false, server);
                    }

                })
                .catch(error => {
                    broadCastReadiness(false, server);
                });

            break;
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