#!/usr/bin/env node

var WebSocketServer = require('websocket').server,
    http = require('http'),
    fs = require('fs');

var server = http.createServer(function(request, response) {
  var filePath;
  if (request.url == '/') {
    filePath = './public/index.html';
  } else {
    filePath = './public/client.js';
  }
  var data = fs.readFileSync(filePath, 'utf8');
  console.log((new Date()) + " Received request for " + request.url);
  response.end(data);
});

server.listen(8080, function() {
  console.log((new Date()) + ' Server is listening on port 8080');
});

var ws = new WebSocketServer({
  httpServer: server,
  maxReceivedFrameSize: 0x1000000,
  autoAcceptConnections: false
});

function originIsAllowed(origin) {
  // put logic here to detect whether the specified origin is allowed.
  return true;
}

ws.on('request', function(req) {
  var con = req.accept(null, req.origin);

  con.on('message', function(message) {
    if (message.type === 'utf-8') {
      // text data
      console.log(message);
    } else if (message.type === 'binary') {
      console.log((new Date()) + ' Server on message');

      var data = message.binaryData,
          len = data.length,
          buf = new Buffer(len);

      for (var i = 0; i < len; i+=4) {
        var r = data.readUInt8(i),
            g = data.readUInt8(i+1),
            b = data.readUInt8(i+2),
            y = Math.floor((77*r + 28*g + 151*b)/255);

        // Canvasにそのまま投入するために
        // 4チャンネル8ビットのRGBAにする
        var v = y + (y << 8) + (y << 16) + (0xFF << 24);
        buf.writeInt32LE(v, i);
      }
      con.sendBytes(buf);
    }
  });

  con.on('close', function(reasonCode, description) {
    console.log((new Date()) + ' Peer ' + con.remoteAddress + ' disconnected.');
  });

});
