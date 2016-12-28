var socketio = require('socket.io');
var io;
var guestNumber = 1;
var nickNames = {};
var namesUsed = [];
var currentRoom = {};

function assignGuestName(socket, guestNumber, nickNames, namesUsed) {
    var guestName = 'Guest' + guestNumber;
    nickNames[socket.id] = guestName;
    namesUsed.push(guestName);
    socket.emit('nameResult', {
        sucess: true;
        name: guestName;
    });
    return guestNumber + 1;
}

function joinRoom(socket, roomName) {
    socket.join(roomName);
    currentRoom[socket.id] = roomName;
    socket.emit('joinResult', {room: roomName});
}

exports.listen = function(server) {
    io = socketio.listen(server);
    io.set('log level', 1);
    io.sockets.on('connection', function(socket) {
        // Handling guest name assignment
        guestNumber = assignGuestName(socket, guestNumber, nickNames, namesUsed);
        // Handling room changing request
        // Handling name changing request
        // Handling sending chat messages
        // Handling room creation request
        // Handling user disconnection
    });
}
