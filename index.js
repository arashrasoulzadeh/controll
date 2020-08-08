const socketio = require('./src/functions/socket');
const file = require('./src/functions/file');
const job = require('./src/functions/job');
const modules = require('./src/functions/modules');

const io = socketio.io
/**
 * reset the server memory
 */
function reset() {
    this.probes = {
        "readiness": [],
        "liveness": []
    }
    modules.reloadModules()
}

/**
 * monitor websocket connection , here is the router for all user requests
 */
io.on('connection', (socket) => {
    console.log('a user connected');
    socket.on('disconnect', () => {
        console.log('user disconnected');
    });
    socket.on('modules', (msg) => {
        socketio.send(socket, "modules", modules.getModules())
    });
    socket.on('job', (msg) => {
        job.handle(modules.getModules(), msg)
    });

});


/** we watch for file changes in both modules and jobs */
file.watchFile('modules.json', reset)
file.watchFile('jobs.json', reset)
/** and reaload the modules for first time */
modules.reloadModules()


// var ssh_client = ssh.tunnel({
//     host: '212.33.197.42',
//     port: 1313,
//     username: 'root',
//     password: 'UU4{7)?Fby13',
// });
// ssh_client.on("ready", function () {
//     console.log("ready")
//     ssh_client.exec('uptime', function (err, stream) {
//         if (err) throw err;
//         stream.on('close', function (code, signal) {
//             // console.log('Stream :: close :: code: ' + code + ', signal: ' + signal);
//             ssh_client.end();
//         }).on('data', function (data) {
//             // console.log('STDOUT: ' + data);

//             info = monitors.uptime(data)
//             console.log(info)

//         }).stderr.on('data', function (data) {
//             console.log('STDERR: ' + data);
//         });
//     });

// })
// ssh_client.on('data', function (data) {
//     console.log('OUTPUT: ' + data);
// });