const { CHAT_MESSAGE_SENT, CHAT_MESSAGE_RECEIVED } = events

$(function () {
  var socket = io();
  $('form').submit(function(e){
    e.preventDefault(); // prevents page reloading
    socket.emit(CHAT_MESSAGE_SENT, $('#m').val());
    $('#m').val('');
    return false;
  });
  socket.on(CHAT_MESSAGE_RECEIVED, function(msg){
    $('#messages').append($('<li>').text(msg));
  });
});
