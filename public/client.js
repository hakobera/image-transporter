var socket = null;

function makeImage(context) {
  for(var i=0; i<1000; i++) {
    context.beginPath();
    var r = Math.floor(Math.random() * 256);
    var g = Math.floor(Math.random() * 256);
    var b = Math.floor(Math.random() * 256);
    context.strokeStyle = 'rgb(' + r + ',' + g + ',' + b + ')';
    context.moveTo(Math.random()*200, Math.random()*200);
    context.lineTo(Math.random()*200, Math.random()*200);
    context.stroke();
  }
}

function bootstrap() {
  var video = document.getElementById('myVideo');
  // OperaはgetUserMediaを使う
  navigator.webkitGetUserMedia("audio, video", success, error);

  function success(stream) {
    console.log(stream);
    video.src = window.webkitURL.createObjectURL(stream);
  }

  function error(err) {
    console.log(err);
  }

  var path = window.location.hostname + ':' + window.location.port;

  // 適当な図形を描画
  var c = document.getElementById('mycanvas');
  var ctx = c.getContext('2d');
  ctx.drawImage(video, 0, 0);

  // Socketの初期化
  socket = new WebSocket('ws://' + path);
  socket.binaryType = 'arraybuffer';
  socket.onopen = function() {
    setInterval(function() {
      ctx.drawImage(video, 0, 0, 200, 160);
      send(ctx);
    }, 500);
  };
  socket.onmessage = handleReceive;
};

function send(ctx) {
  // RAWデータをそのまま送信
  var data = ctx.getImageData(0, 0, 200, 160).data;
  var byteArray = new Uint8Array(data);
  socket.send(byteArray.buffer);
}

function handleReceive(message) {
  // 受信したRAWデータをcanvasに
  var c = resultCanvas = document.getElementById('result');
  var ctx = c.getContext('2d');
  var imageData = ctx.createImageData(200, 160);
  var pixels = imageData.data;

  var buffer = new Uint8Array(message.data);
  for (var i=0; i < pixels.length; i++) {
    pixels[i] = buffer[i];
  }
  ctx.putImageData(imageData, 0, 0);
}