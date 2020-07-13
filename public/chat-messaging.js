(function (app, events) {
  app.setupChatMessaging = (socket, user, $form, $input, $messages) => {

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
}(this.app = this.app || {}, this.events));
