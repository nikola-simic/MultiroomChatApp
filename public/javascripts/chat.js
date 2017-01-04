var Chat = function(socket) {
    this.socket = socket;
}

Chat.prototype.sendMessage(room, message) {
    var messageToSend = {
      room: room,
      text: message
    };
    this.socket.emit('message', messageToSend);
}

Chat.prototype.changeRoom = function(room) {
    var roomToChange = {newRoom: room};
    this.socket.emit('emit', roomToChange);
}

Chat.prototype.changeNick = function(name) {
    this.socket.emit('nameAttempt', name);
}

Chat.prototype.processCommand = function(command) {
    var commandOk = false;
    
    var tokens = command.split(' ');
    var parsedCommand = tokens[0].toLowerCase();
    
    switch(parsedCommand) {
        case '/join':
            var roomName = tokens[1];
            this.changeRoom(roomName);
            commandOk = true;
            break;
        case '/nick':
            var name = tokens[1];
            this.changeNick(name);
            commandOk = true;
            break;
        default:
            commandOk = false;
            break;
    }
    
    return commandOk;
}