var app = require('express')();
var http = require('http').createServer(app);
var io = require('socket.io')(http);
var events = require('./events')

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/src/index.html');
});

app.get('/events.js', (req, res) => {
  res.sendFile(__dirname + '/events.js');
});

app.get('/app.js', (req, res) => {
  res.sendFile(__dirname + '/src/app.js');
});

app.get('/styles.css', (req, res) => {
  res.sendFile(__dirname + '/src/styles.css');
});

const { CHAT_MESSAGE_SENT, CHAT_MESSAGE_RECEIVED } = events

io.on('connection', (socket) => {
  console.log(CHAT_MESSAGE_SENT)
  socket.on(CHAT_MESSAGE_SENT, (msg) => {
    console.log(CHAT_MESSAGE_RECEIVED, msg)
    io.emit(CHAT_MESSAGE_RECEIVED, msg);
  });
});

http.listen(3000, () => {
  console.log('listening on *:3000');
});
