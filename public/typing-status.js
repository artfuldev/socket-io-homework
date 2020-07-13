(function (app, events) {
  app.setupTypingStatusUpdates = (socket, $input, $typists) => {

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
}(this.app = this.app || {}, this.events));
