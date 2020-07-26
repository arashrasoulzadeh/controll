var app = require('express')();
var http = require('http').createServer(app);
var io = require('socket.io')(http);
var port = 3001;
const fs = require('fs');
require('log-timestamp');

const buttonPressesLogFile = 'modules.json';

app.get('/', (req, res) => {
    res.sendFile(__dirname + '/index.html');
});

function send(socket, name, object) {
    console.log("sending to channel => " + name)
    console.log(object)
    socket.emit(name, object);
    console.log("send completed.")
}

function broadcast(channel, object) {
    console.log("broadcasting to channel ${channel} ...")
    io.emit(channel, object);
    console.log("broadcast completed.")
}






console.log(`Watching for file changes on ${buttonPressesLogFile}`);

fs.watchFile(buttonPressesLogFile, (curr, prev) => {
    console.log(`${buttonPressesLogFile} file Changed`);
    reloadModules();
});








var modules = [];

function reloadModules() {
    let rawdata = fs.readFileSync('modules.json');
    modules = JSON.parse(rawdata);
    broadcast("modules", modules);
}

io.on('connection', (socket) => {
    console.log('a user connected');
    socket.on('disconnect', () => {
        console.log('user disconnected');
    });
    socket.on('modules', (msg) => {
        send(socket, "modules", modules)
    });

});


http.listen(port, () => {
    console.log('listening on *:' + port);
});