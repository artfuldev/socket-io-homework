const { CHAT_MESSAGE_SENT, CHAT_MESSAGE_RECEIVED, USER_CONNECTED, USER_DISCONNECTED } = events

$(function () {

  const socket = io();
  const $input = $('#message-input');
  const $messages = $('#messages');
  const $form = $('#message-input-form');
  const $status = $('#status');
  const STATUS_PERSISTENCE_TIME = 1500;

  $form.submit(event => {
    event.preventDefault();
    event.stopPropagation();
    socket.emit(CHAT_MESSAGE_SENT, $input.val())
    $input.val('');
  });

  socket.on(CHAT_MESSAGE_RECEIVED, message => {
    $messages.append($('<li>').text(message));
  });

  const status = text => {
    const $update = $('<li>').addClass('status-message').text(text)
    $status.append($update);
    setTimeout(() => $update.remove(), STATUS_PERSISTENCE_TIME);
  }

  socket.on(USER_CONNECTED, () => status('user connected'));
  socket.on(USER_DISCONNECTED, () => status('user disconnected'));
});
