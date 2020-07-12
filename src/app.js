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
    const message = $input.val();
    socket.emit(CHAT_MESSAGE_SENT, message);
    receive({ from: user, message });
    $input.val('');
  });

  const receive = ({ from, message }) => {
    const $message = $('<li>').text(from + ": " + message);
    if (from == user) $message.addClass('own-message');
    $messages.append($message);
  };

  const status = text => {
    const $update = $('<li>').addClass('status-message').text(text)
    $status.append($update);
    setTimeout(() => $update.remove(), STATUS_PERSISTENCE_TIME);
  };

  socket.on(USER_CONNECTED, nickname => status(nickname + ' connected'));
  socket.on(USER_DISCONNECTED, nickname => status(nickname + ' disconnected'));
  socket.on(NICKNAME_OBTAINED, nickname => { user = nickname; $('main').show(); $('aside').hide(); });
  socket.on(CHAT_MESSAGE_RECEIVED, receive);
  socket.emit(NICKNAME_REQUESTED, prompt('Enter nickname:'));
});
