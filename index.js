var app = require('express')();
var http = require('http').createServer(app);
var io = require('socket.io')(http);
var events = require('./events');

const active_nicknames = new Set();

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
  NICKNAME_REQUESTED, NICKNAME_OBTAINED,
  TYPING_STARTED, TYPING_STOPPED
} = events

const nickname = (requested_nickname, suffix = "") => {
  if (!active_nicknames.has(requested_nickname + suffix)) {
    active_nicknames.add(requested_nickname + suffix);
    return requested_nickname + suffix;
  }
  return nickname(requested_nickname, "#" + Math.floor(1000 + Math.random() * 9000));
}

io.on('connection', socket => {
  socket.on(NICKNAME_REQUESTED, requested_nickname => {
    const user = nickname(requested_nickname);
    socket.emit(NICKNAME_OBTAINED, user);
    active_nicknames.forEach(nickname => { if (user !== nickname) socket.emit(USER_CONNECTED, { user: nickname, silent: true }); });
    socket.broadcast.emit(USER_CONNECTED, { user });
    socket.on(CHAT_MESSAGE_SENT, message => socket.broadcast.emit(CHAT_MESSAGE_RECEIVED, { from: user, message }));
    socket.on('disconnect', () => { io.emit(USER_DISCONNECTED, user); active_nicknames.delete(user); });
    socket.on(TYPING_STARTED, () => socket.broadcast.emit(TYPING_STARTED, user));
    socket.on(TYPING_STOPPED, () => socket.broadcast.emit(TYPING_STOPPED, user));
  });
});

http.listen(3000, () => {
  console.log('listening on *:3000');
});
