var http = require('http');
var fs = require('fs');
var path = require('path');
var mime = require('mime');
var cache = {};

function sendFile(response, filePath, content) {
	response.writeHead(200, {
		'Content-Type' : mime.lookup(path.basename(filePath))
	});
	response.end(content);
}

function send404(response) {
	response.writeHead(404, {
		'Content-Type' : 'text/plain'
	});
	response.end('Error 404: Resource not found!');
}

function serveStatic(response, cache, absPath) {
	if(cache[absPath]) {
		sendFile(response, absPath, cache[absPath]);
	} else {
		fs.readFile(absPath, 'utf-8', function(err, data) {
			if(err) {
				send404(response);
			} else {
				cache[absPath] = data;
				sendFile(response, absPath, data);
			}
		});
	}
}

var server = http.createServer(function(request, response) {
	var filePath = '';
	
	if(request.url == '/') {
		filePath = 'public/index.html';
	}
	
	absPath = './' + filePath;
	
	serveStatic(response, cache, absPath);
});

server.listen(3000, function(){
	console.log('Server listening on port 3000');
});