var app = require('express')();
var http = require('http').createServer(app);
var io = require('socket.io')(http);
const port = 3001;


function send(socket, name, object) {
    io.emit(name, object);
}

function broadcast(channel, object) {
    io.emit(channel, object);
}

function notify(socket, type, message) {
    socketio.send(socket, "notification", {
        "type": type,
        "message": message
    });
}


http.listen(port, () => {
    console.log('listening on *:' + port);
});

module.exports.io = io
module.exports.broadcast = broadcast
module.exports.send = send
module.exports.notify = notify