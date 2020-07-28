var app = require('express')();
var http = require('http').createServer(app);
var io = require('socket.io')(http);
const fs = require('fs');
var probes = null;
const {
    v4: uuidv4
} = require('uuid');
const axios = require('axios');

require('log-timestamp');


const port = 3001;
const {
    exec
} = require("child_process");
const {
    time
} = require('console');
const {
    checkServerIdentity
} = require('tls');



var modules = [];
var jobs = [];



function watchFile(file, callback) {
    console.log(`Watching for file changes on ${file}`);
    fs.watchFile(file, (curr, prev) => {
        console.log(`${file} file Changed`);
        callback()
    });
}

function send(socket, name, object) {
    socket.emit(name, object);
}

function broadcast(channel, object) {
    io.emit(channel, object);
}

function notify(socket, type, message) {
    send(socket, "notification", {
        "type": type,
        "message": message
    });
}

function jobOutput(job_id, server_id, output) {
    return {
        "id": job_id,
        "server_id": server_id,
        "output": output
    }
}

function findJobById(id) {
    job_object = null;
    modules.active.forEach(function (data, index) {
        data.servers.forEach(function (server, index) {
            server.jobs.forEach(function (job, index) {
                if (job.id == id) {
                    job_object = job;
                }
            });
        });
    });
    return job_object;
}

function broadCastReadiness(status, server) {
    broadcast("readiness", {
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

    this.probes.readiness.push(func);
    // console.log(func);
}


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
    jobs = JSON.parse(rawdata);
    modules.meta = {
        "id": uuidv4(),
        "created_at": new Date()
    };
    modules.active.forEach(function (data, index) {
        data.id = uuidv4();
        data.servers.forEach(function (server, index) {
            server.id = uuidv4();
            if (server.health && server.health.readiness) {
                addReadinessProbe(server);
            }
            server.jobs.forEach(function (job, index) {
                job.id = uuidv4();
                job.server_id = server.id;
            });
        });
    });

    broadcast("modules", modules);
    console.log("total of", modules.active.length, "modules loaded!")
}

io.on('connection', (socket) => {
    console.log('a user connected');
    socket.on('disconnect', () => {
        console.log('user disconnected');
    });
    socket.on('modules', (msg) => {
        send(socket, "modules", modules)
    });
    socket.on('job', (msg) => {
        job = findJobById(msg.job_id);
        if (job == null) {
            notify(socket, "error", "Cant find job")
        } else {
            exec(jobs[job.name], (error, stdout, stderr) => {
                if (error) {
                    send(socket, "job", jobOutput(job.id, job.server_id, error.message))
                    return;
                }
                if (stderr) {
                    send(socket, "job", jobOutput(job.id, job.server_id, stderr))
                    return;
                }
                send(socket, "job", jobOutput(job.id, job.server_id, stdout))
            });
        }

    });

});


http.listen(port, () => {
    console.log('listening on *:' + port);
});
watchFile('modules.json', reloadModules)
watchFile('jobs.json', reloadModules)
reloadModules()