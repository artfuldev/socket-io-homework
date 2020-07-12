const {
  CHAT_MESSAGE_SENT, CHAT_MESSAGE_RECEIVED,
  USER_CONNECTED, USER_DISCONNECTED,
  NICKNAME_REQUESTED, NICKNAME_OBTAINED
} = events

$(function () {

  const socket = io();
  const $input = $('#message-input');
  const $messages = $('#messages');
  const $form = $('#message-input-form');
  const $status = $('#status');
  const STATUS_PERSISTENCE_TIME = 1500;
  var user;

  $form.submit(event => {
    event.preventDefault();
    event.stopPropagation();
    socket.emit(CHAT_MESSAGE_SENT, $input.val())
    $input.val('');
  });

  socket.on(CHAT_MESSAGE_RECEIVED, ({ from, message }) => {
    $messages.append($('<li>').text(from + ": " + message));
  });

  const status = text => {
    const $update = $('<li>').addClass('status-message').text(text)
    $status.append($update);
    setTimeout(() => $update.remove(), STATUS_PERSISTENCE_TIME);
  }

  socket.on(USER_CONNECTED, nickname => status(nickname + ' connected'));
  socket.on(USER_DISCONNECTED, nickname => status(nickname + ' disconnected'));
  socket.on(NICKNAME_OBTAINED, nickname => { user = nickname; $('main').show(); $('aside').hide(); });
  socket.emit(NICKNAME_REQUESTED, prompt('Enter nickname:'));
});
