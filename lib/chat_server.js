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
        sucess: true,
        name: guestName
    });
    return guestNumber + 1;
}

function joinRoom(socket, roomName) {
    socket.join(roomName);
    currentRoom[socket.id] = roomName;
    socket.emit('joinResult', {room: roomName});
    socket.broadcast.to(roomName).emit('message', {text: 'User ' + nickNames[socket.id] + ' has joined a room ' + roomName + '.'});
    var usersInRoomSummary = 'Users currently in room: ' + roomName;
    var usersInRoom = io.sockets.clients(roomName);
    if(usersInRoom > 1) {
        for(var index in usersInRoom) {
            var userSocketId = usersInRoom[index].id;
            if(userSocketId != socket.id) {
                if(index > 0) {
                   usersInRoomSummary += ', ';
                }
                usersInRoomSummary += nickNames[userSocketId];            
            }
        }
        usersInRoomSummary += '.';
    }
    socket.emit('message', {text: usersInRoomSummary});
}

function handleNameChangeAttempts(socket, nickNames, namesUsed) {
    socket.on('nameAttempt', function(name) {
        if(name.indexOf('Guest') == 0) {
            socket.emit('nameResult', {
                success: false,
                message: 'Name cannot begin with "Guest"'
            });
        } else if(namesUsed.indexOf(name) != -1) {
            socket.emit('nameResult', {
                success: false,
                message: 'Name is already in use'
            });
        } else {
            var indexToDelete = namesUsed[nickNames[socket.id]];
            var oldName = nickNames[socket.id];
            nickNames[socket.id] = name;
            delete namesUsed[indexToDelete];
            namesUsed.push(name);
            socket.emit('nameResult', {
                success: true,
                newName: name
            });
            socket.broadcast.to(currentRoom[socket.id]).emit('message', {
                text: 'User ' + oldName + ' changed name to: ' + name
            });
        }
    });
}

function handleMessageBroadcasting(socket) {
    socket.on('message', function(message) {
        socket.broadcast.to(message.room).emit('message', {
            text: nickNames[socket.id] + ': ' + message.text 
        });
    });
}

function handleRoomJoining(socket) {
    socket.on('join', function(message) {
        socket.leave(currentRoom[socket.id]);
        joinRoom(socket, message.newRoom);
    });
}

function handleClientDisconnection(socket) {
    socket.on('disconnect', function() {
        var nickNameIndex = namesUsed.indexOf(nickNames[socket.id]);
        delete nickNames[socket.id];
        delete namesUsed[nickNameIndex];
    });
}

exports.listen = function(server) {
    io = socketio.listen(server);
    io.set('log level', 1);
    io.sockets.on('connection', function(socket) {
        // Handling guest name assignment
        guestNumber = assignGuestName(socket, guestNumber, nickNames, namesUsed);
        // Handling room changing request
        joinRoom(socket, 'Lobby');
        // Handling name changing request
        handleNameChangeAttempts(socket, nickNames, namesUsed);
        // Handling sending chat messages
        handleMessageBroadcasting(socket);
        // Handling room creation request
        handleRoomJoining(socket);
        // Handling user disconnection
        handleClientDisconnection(socket);
    });
}
