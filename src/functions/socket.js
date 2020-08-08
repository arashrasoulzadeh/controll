var app = require('express')();
var http = require('http').createServer(app);
var io = require('socket.io')(http);
const port = process.env.PORT;

/**
 * send a message to a certain socket
 * @param {socket} socket 
 * @param {string} name 
 * @param {object} object 
 */
function send(socket, name, object) {
    io.emit(name, object);
}
/**
 * broadcast to a certain channel in all websocket clients  
 * @param {string} channel 
 * @param {object} object 
 */
function broadcast(channel, object) {
    io.emit(channel, object);
}
/**
 * send a notification object to client
 * @param {socket} socket 
 * @param {string} type 
 * @param {string} message 
 */
function notify(socket, type, message) {
    socketio.send(socket, "notification", {
        "type": type,
        "message": message
    });
}

/** start listening */
http.listen(port, () => {
    console.log('listening on *:' + port);
});

module.exports.io = io
module.exports.broadcast = broadcast
module.exports.send = send
module.exports.notify = notify