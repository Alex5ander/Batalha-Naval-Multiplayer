const network = (onDisconnect, onInitConfig, onUpdate) => {
  const socket = io();

  socket.on('connect_error', onDisconnect);

  socket.on('another_player_disconnected', onDisconnect);
  socket.on('disconnect', onDisconnect);

  socket.on('init-config', onInitConfig);

  socket.on('update-game', onUpdate);

  const loadGrid = (data) => socket.emit('load-grid', data);

  const firing = (coords) => socket.emit('firing', coords);

  const disconnect = () => socket.close();

  return { loadGrid, firing, disconnect };
};

export { network };
