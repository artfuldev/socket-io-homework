$(function () {

  const setupTypingStatusUpdates = (socket, $input, $typists) => {

    const { TYPING_STARTED, TYPING_STOPPED } = events;
    var typing_timeout = undefined;
    var typing = false;
    const typists = new Set();
    const TYPING_TOLERANCE_TIME = 900;

    const typingStatusText = last_user => {
      if (typists.size == 0) return "";
      const user = last_user || typists.values().next().value;
      return typists.size == 1
        ? user + " is typing..."
        : user + " and " + (typists.size - 1) + " others typing...";
    }

    const stopTyping = () => {
      typing = false;
      socket.emit(TYPING_STOPPED);
    };

    const startTyping = () => {
      typing = true;
      socket.emit(TYPING_STARTED);
    };
    
    $input.on('input', () => {
      if (typing_timeout != undefined) {
        clearTimeout(typing_timeout);
        typing_timeout = undefined;
      }
      if (!typing) startTyping();
      typing_timeout = setTimeout(stopTyping, TYPING_TOLERANCE_TIME);
    });

    $input.on('focus', stopTyping);

    socket.on(TYPING_STARTED, user => {
      typists.add(user);
      $typists.text(typingStatusText(user));
    });

    socket.on(TYPING_STOPPED, user => {
      typists.delete(user);
      $typists.text(typingStatusText());
    });
  };

  const setupChatMessaging = (socket, user, $form, $input, $messages) => {

    const { CHAT_MESSAGE_SENT, CHAT_MESSAGE_RECEIVED } = events;

    const parse = text => {
      if (!text.match(/\/whisper:\w.*/g)) return { message: text };
      const split = text.replace(' ', ':::').split(':::');
      const to = split[0].split(':').pop();
      const message = split[1];
      return { message, to };
    };
  
    const receive = ({ from, message }) => {
      const $message = $('<li>').text(from + ": " + message);
      if (from == user) $message.addClass('own-message');
      $messages.append($message);
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

    socket.on(CHAT_MESSAGE_RECEIVED, receive);
  };

  const handleUserConnections = (socket, $status, $users) => {
    
    const { USER_CONNECTED, USER_DISCONNECTED } = events
    const STATUS_PERSISTENCE_TIME = 1500;
    const active_users = new Set();

    const status = text => {
      const $update = $('<li>').addClass('status-message').text(text);
      $status.append($update);
      setTimeout(() => $update.remove(), STATUS_PERSISTENCE_TIME);
    };
  
    const id = user => user.replace('#', '_');
  
    socket.on(USER_CONNECTED, ({ user, silent }) => {
      if (!silent) status(user + ' connected');
      active_users.add(user);
      const element_id = id(user);
      $users.find('#' + element_id).remove();
      $('<li>', { id: element_id }).text(user).appendTo($users);
    });
  
    socket.on(USER_DISCONNECTED, user => {
      status(user + ' disconnected');
      active_users.delete(user);
      $users.find('#' + id(user)).remove();
    });

  };

  const { NICKNAME_REQUESTED, NICKNAME_OBTAINED } = events;
  const socket = io();
  const $input = $('#message-input');

  handleUserConnections(socket, $('#status'), $('#users'));
  setupTypingStatusUpdates(socket, $input, $('#typing-status'));
  socket.on(NICKNAME_OBTAINED, nickname => {
    $('#overlay').hide();
    setupChatMessaging(socket, nickname, $('#message-input-form'), $input, $('#messages'));
  });
  socket.emit(NICKNAME_REQUESTED, prompt('Enter nickname:'));
});
