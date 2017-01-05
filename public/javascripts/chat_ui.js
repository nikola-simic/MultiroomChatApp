function divEscapedContentElement(message) {
    $('<div></div>').text(message);
}

function divSystemContentElement(message) {
    $('<div></div>').html('<i>' + message + '</i>');
}

function processUserInput(chatApp, socket) {
    var message = $('#send-message').val();
    if(message.charAt(0) == '/') {
        var systemMessage = chatApp.processCommand(message);
        if(systemMessage) {
            $('#messages').append(divSystemContentElement('Command successfully executed.'));
        } else {
            $('#messages').append(divSystemContentElement('Command failed to execute.'));
        }
    } else {
        chatApp.sendMessage($('#room').text(), message);
        $('#messages').append(divEscapedContentElement(message))
    }
    
    $('#send-message').val('');
}

$(document).ready(function() {

    var socket = io.connect();
    var chatApp = new Chat(socket);
    
    socket.on('nameResult', function(result) {
        var message;
        if(result.success) {
            message = 'You are now know as ' + result.name + '.';
        } else {
            message = result.message;
        }
        $('#messages').append(divSystemContentElement(message));
    });
    
    socket.on('joinResult', function(result) {
        $('#room').text(result.room);
        $('#messages').append(divSystemContentElement('Room changed'));
    });
    
    socket.on('message', function(message) {
        var newElement = $('<div></div>').text(message.text);
        $('#messages').append(newElement);
    });
   
    socket.on('rooms', function(rooms) {
        $('#room-list').empty();
        for(var room in rooms) {
            $('#room-list').append(divEscapedContentElement(room));
        }
        $('#room-list div').click(function() {
            chatApp.processCommand('/join ' + $(this).text());
            $('#send-message').focus();
        });
    });
    
    setInterval(function() {
        socket.emit('rooms');
    }, 1000);
    
    $('#send-message').focus();
    $('#send-form').submit(function() {
        processUserInput(chatApp, socket);
    });
});