var app = require('express')();
var http = require('http').createServer(app);
var io = require('socket.io')(http);
const fs = require('fs');
const {
    v4: uuidv4
} = require('uuid');

require('log-timestamp');


const port = 3001;
const {
    exec
} = require("child_process");
const {
    time
} = require('console');



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
    console.log("sending to channel => " + name)
    console.log(object)
    socket.emit(name, object);
    console.log("send completed.")
}

function broadcast(channel, object) {
    console.log("broadcasting to channel", channel)
    io.emit(channel, object);
    console.log("broadcast completed.")
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



function reloadModules() {
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
            server.jobs.forEach(function (job, index) {
                job.id = uuidv4();
                job.server_id = server.id;
            });
        });
    });
    console.log(modules)

    broadcast("modules", modules);
    console.log("total of", modules.length, "modules loaded!")
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