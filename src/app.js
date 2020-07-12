const {
  CHAT_MESSAGE_SENT, CHAT_MESSAGE_RECEIVED,
  USER_CONNECTED, USER_DISCONNECTED,
  NICKNAME_REQUESTED, NICKNAME_OBTAINED,
  TYPING_STARTED, TYPING_STOPPED
} = events

$(function () {

  const socket = io();
  const $input = $('#message-input');
  const $messages = $('#messages');
  const $form = $('#message-input-form');
  const $status = $('#status');
  const $typists = $('#typing-status');
  const $users = $('#users');
  const STATUS_PERSISTENCE_TIME = 1500;
  const TYPING_TOLERANCE_TIME = 900;
  var user;
  var typing_timeout;
  var typing;
  var active_users = new Set();

  const stopTyping = () => { typing = false; socket.emit(TYPING_STOPPED); }
  const startTyping = () => { typing = true; socket.emit(TYPING_STARTED); }
  
  $input.on('input', () => {
    if (typing_timeout != undefined) {
      clearTimeout(typing_timeout);
      typing_timeout = undefined;
    }
    if (!typing) startTyping();
    typing_timeout = setTimeout(stopTyping, TYPING_TOLERANCE_TIME);
  });

  $input.on('focus', stopTyping);

  const parse = text => {
    if (!text.match(/\/whisper:\w.*/g)) return { message: text };
    const split = text.replace(' ', ':::').split(':::');
    const to = split[0].split(':').pop();
    const message = split[1];
    return { message, to };
  };

  $form.submit(event => {
    event.preventDefault();
    event.stopPropagation();
    const chat_message = parse($input.val());
    socket.emit(CHAT_MESSAGE_SENT, chat_message);
    receive({ from: user, message: chat_message.message });
    $input.val('');
    $input.trigger('focus');
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

  const typists = new Set();

  const updateTypingStatus = last_user => {
    const user = last_user || typists.values().next().value
    const message =
      typists.size == 0
      ? ""
      : typists.size == 1
        ? user + " is typing..."
        : user + " and " + (typists.size - 1) + " others typing...";
    $typists.text(message);
  }

  const startedTyping = user => {
    typists.add(user);
    updateTypingStatus(user);
  };

  const stoppedTyping = user => {
    typists.delete(user);
    updateTypingStatus();
  };

  const userConnected = ({ user, silent }) => {
    if (!silent) status(user + ' connected');
    active_users.add(user);
    const id = '#' + user.replace('#', '_');
    $users.find(id).remove();
    $('<li>', { id }).text(user).appendTo($users);
  }

  const userDisconnected = user => {
    status(user + ' disconnected');
    active_users.delete(user);
    const id = '#' + user.replace('#', '_');
    $users.find(id).remove();
  }

  socket.on(USER_CONNECTED, userConnected);
  socket.on(USER_DISCONNECTED, userDisconnected);
  socket.on(NICKNAME_OBTAINED, nickname => { user = nickname; $('#overlay').hide(); });
  socket.on(CHAT_MESSAGE_RECEIVED, receive);
  socket.on(TYPING_STARTED, startedTyping);
  socket.on(TYPING_STOPPED, stoppedTyping);
  socket.emit(NICKNAME_REQUESTED, prompt('Enter nickname:'));
});
