(function (app, events) {
  app.handleUserConnections = (socket, $status, $users) => {
    
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
}(this.app = this.app || {}, this.events));
