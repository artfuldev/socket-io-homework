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

const {
  CHAT_MESSAGE_SENT, CHAT_MESSAGE_RECEIVED,
  USER_CONNECTED, USER_DISCONNECTED,
  NICKNAME_REQUESTED, NICKNAME_OBTAINED
} = events

io.on('connection', socket => {
  socket.on(NICKNAME_REQUESTED, nickname => {
    socket.emit(NICKNAME_OBTAINED, nickname);
    socket.broadcast.emit(USER_CONNECTED, nickname);
    socket.on(CHAT_MESSAGE_SENT, message => io.emit(CHAT_MESSAGE_RECEIVED, { from: nickname, message }));
    socket.on('disconnect', () => io.emit(USER_DISCONNECTED, nickname));
  });
});

http.listen(3000, () => {
  console.log('listening on *:3000');
});
