const { CHAT_MESSAGE_SENT, CHAT_MESSAGE_RECEIVED } = events

$(function () {

  const socket = io();
  const $input = $('#message-input');
  const $messages = $('#messages');
  const $form = $('#message-input-form');

  $form.submit(event => {
    event.preventDefault();
    event.stopPropagation();
    socket.emit(CHAT_MESSAGE_SENT, $input.val())
    $input.val('');
  });

  socket.on(CHAT_MESSAGE_RECEIVED, message => {
    $messages.append($('<li>').text(message));
  });

});
