$(function (app, events) {
  const { NICKNAME_REQUESTED, NICKNAME_OBTAINED } = events;
  const socket = io();
  const $input = $('#message-input');

  app.handleUserConnections(socket, $('#status'), $('#users'));
  app.setupTypingStatusUpdates(socket, $input, $('#typing-status'));
  socket.on(NICKNAME_OBTAINED, nickname => {
    $('#overlay').hide();
    app.setupChatMessaging(socket, nickname, $('#message-input-form'), $input, $('#messages'));
  });
  socket.emit(NICKNAME_REQUESTED, prompt('Enter nickname:'));
}(this.app = this.app || {}, this.events));
