const socketio = require('./src/functions/socket');
const file = require('./src/functions/file');
const job = require('./src/functions/job');
const modules = require('./src/functions/modules');
const io = socketio.io

function reset() {
    this.probes = {
        "readiness": [],
        "liveness": []
    }
    modules.reloadModules()
}


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


file.watchFile('modules.json', reset)
file.watchFile('jobs.json', reset)
modules.reloadModules()