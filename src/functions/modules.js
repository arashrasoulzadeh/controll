const fs = require('fs');
const socketio = require('./socket')
const job = require('./job');
const health = require("./health")
const ssh = require("./ssh")






const {
    v4: uuidv4
} = require('uuid');
var modules = [];

/**
 * reload modules from the file 
 */
function reloadModules() {
    let rawdata = fs.readFileSync('modules.json');
    modules = JSON.parse(rawdata);
    rawdata = fs.readFileSync('jobs.json');
    job.setJobs(JSON.parse(rawdata));
    modules.meta = {
        "id": uuidv4(),
        "created_at": new Date()
    };
    modules.active.forEach(function (data, index) {
        data.id = uuidv4();
        data.servers.forEach(function (server, index) {
            server.id = uuidv4();
            // server.tunnel = ssh.tunnel(server.ssh);
            console.log(server.tunnel)
            if (server.health && server.health.readiness) {
                health.addReadinessProbe(server);
            }
            if (server.health && server.health.liveness) {
                health.addLivenessProbe(server);
            }
            server.jobs.forEach(function (job, index) {
                job.id = uuidv4();
                job.server_id = server.id;
            });
        });
    });

    socketio.broadcast("modules", modules);
    console.log("total of", modules.active.length, "modules loaded!")
}
/**
 * getter for modules 
 */
function getModules() {
    return modules;
}

module.exports.reloadModules = reloadModules
module.exports.getModules = getModules