(function(exports) {
  exports.CHAT_MESSAGE_SENT = "chat:message_sent"
  exports.CHAT_MESSAGE_RECEIVED = "chat:message_received"
  exports.USER_CONNECTED = "user:connected"
  exports.USER_DISCONNECTED = "user:disconnected"
  exports.NICKNAME_REQUESTED = "nickname:requested"
  exports.NICKNAME_OBTAINED = "nickname:obtained"
  exports.TYPING_STARTED = "typing:started"
  exports.TYPING_STOPPED = "typing:stopped"
}(typeof exports === 'undefined' ? this.events = {} : exports));

