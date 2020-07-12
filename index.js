var app = require('express')();
var http = require('http').createServer(app);
var io = require('socket.io')(http);
var events = require('./events');

const sockets = new Map();

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

const register = (socket, requested_nickname, suffix = "") => {
  const key = requested_nickname + suffix;
  if (!sockets.has(key)) {
    sockets.set(key, socket);
    return key;
  }
  return register(socket, requested_nickname, "#" + Math.floor(1000 + Math.random() * 9000));
}

io.on('connection', socket => {
  socket.on(NICKNAME_REQUESTED, requested_nickname => {
    const user = register(socket, requested_nickname);
    socket.emit(NICKNAME_OBTAINED, user);
    sockets.forEach((_, key) => { if (user !== key) socket.emit(USER_CONNECTED, { user: key, silent: true }); });
    socket.broadcast.emit(USER_CONNECTED, { user });
    socket.on(CHAT_MESSAGE_SENT, ({ message, to }) => {
      if (to == undefined) {
        socket.broadcast.emit(CHAT_MESSAGE_RECEIVED, { from: user, message });
      } else if (sockets.has(to)) {
        sockets.get(to).emit(CHAT_MESSAGE_RECEIVED, { from: user, message });
      }
    });
    socket.on('disconnect', () => { io.emit(USER_DISCONNECTED, user); sockets.delete(user); });
    socket.on(TYPING_STARTED, () => socket.broadcast.emit(TYPING_STARTED, user));
    socket.on(TYPING_STOPPED, () => socket.broadcast.emit(TYPING_STOPPED, user));
  });
});

http.listen(3000, () => {
  console.log('listening on *:3000');
});
