const socketio = require('./src/functions/socket');
const file = require('./src/functions/file');
const job = require('./src/functions/job');

const fs = require('fs');

const io = socketio.io
const health = require('./src/functions/health')
var probes = null;
const {
    v4: uuidv4
} = require('uuid');
const axios = require('axios');

require('log-timestamp');



var modules = [];





function reset() {
    this.probes = {
        "readiness": [],
        "liveness": []
    }
}

function reloadModules() {
    reset();
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
            if (server.health && server.health.readiness) {
                health.addReadinessProbe(server);
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

io.on('connection', (socket) => {
    console.log('a user connected');
    socket.on('disconnect', () => {
        console.log('user disconnected');
    });
    socket.on('modules', (msg) => {
        socketio.send(socket, "modules", modules)
    });
    socket.on('job', (msg) => {
        job.handle(modules, msg)
    });

});


file.watchFile('modules.json', reloadModules)
file.watchFile('jobs.json', reloadModules)
reloadModules()