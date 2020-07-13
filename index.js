const express = require('express');
const app = express();
const path = require('path')
const http = require('http').createServer(app);
const io = require('socket.io')(http);
const events = require('./public/events');

const sockets = new Map();

app.use('/', express.static(path.join(__dirname, 'public')));

const {
  CHAT_MESSAGE_SENT, CHAT_MESSAGE_RECEIVED,
  USER_CONNECTED, USER_DISCONNECTED,
  NICKNAME_REQUESTED, NICKNAME_OBTAINED,
  TYPING_STARTED, TYPING_STOPPED
} = events;

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
    socket.broadcast.emit(USER_CONNECTED, { user });
    Array
      .from(sockets.keys())
      .filter(key => user !== key)
      .forEach(user => socket.emit(USER_CONNECTED, { user, silent: true }));
    socket.on(CHAT_MESSAGE_SENT, ({ message, to }) =>
      [to]
        .map(to => to == undefined ? socket.broadcast : sockets.get(to))
        .filter(Boolean)
        .forEach(socket => socket.emit(CHAT_MESSAGE_RECEIVED, { from: user, message })));
    socket.on('disconnect', () => { io.emit(USER_DISCONNECTED, user); sockets.delete(user); });
    socket.on(TYPING_STARTED, () => socket.broadcast.emit(TYPING_STARTED, user));
    socket.on(TYPING_STOPPED, () => socket.broadcast.emit(TYPING_STOPPED, user));
    socket.emit(NICKNAME_OBTAINED, user);
  });
});

http.listen(3000, () => {
  console.log('listening on *:3000');
});
