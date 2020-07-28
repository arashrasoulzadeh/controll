const socketio = require('./socket')
var jobs = [];

const {
    exec
} = require("child_process");
const {
    time
} = require('console');
const {
    checkServerIdentity
} = require('tls');

function jobOutput(job_id, server_id, output) {
    return {
        "id": job_id,
        "server_id": server_id,
        "output": output
    }
}

function findJobById(modules, id) {
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

function setJobs(new_jobs) {
    jobs = new_jobs;
}

function handle(modules, msg) {
    current_job = findJobById(modules, msg.job_id);
    if (current_job == null) {
        socketio.notify(socketio.socket, "error", "Cant find job")
    } else {
        exec(jobs[current_job.name], (error, stdout, stderr) => {
            if (error) {
                socketio.send(socketio.socket, "job", jobOutput(current_job.id, current_job.server_id, error.message))
                return;
            }
            if (stderr) {
                socketio.send(socketio.socket, "job", jobOutput(current_job.id, current_job.server_id, stderr))
                return;
            }
            socketio.send(socketio.socket, "job", jobOutput(current_job.id, current_job.server_id, stdout))
        });
    }
}

module.exports.jobOutput = jobOutput
module.exports.findJobById = findJobById
module.exports.handle = handle
module.exports.setJobs = setJobs