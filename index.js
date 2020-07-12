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
  io.emit(events.USER_CONNECTED);
  socket.on(CHAT_MESSAGE_SENT, message => io.emit(CHAT_MESSAGE_RECEIVED, message));
  socket.on('disconnect', () => io.emit(events.USER_DISCONNECTED));
});

http.listen(3000, () => {
  console.log('listening on *:3000');
});
