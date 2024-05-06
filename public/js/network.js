/** @param {string} name */
const network = (name) => {
  const socket = io(window.location.href, { reconnection: false, auth: { name } });

  const connect_error = (callback) => socket.on('connect_error', callback);

  const anotherPlayerDisconnected = (callback) => socket.on('another_player_disconnected', callback);

  const onInitConfig = (callback) => socket.on('init_config', callback);

  const onUpdate = (callback) => socket.on('update_game', callback);

  /** @param {{name: string; grid: number[][] }} data */
  const loadGrid = (data) => socket.emit('load_grid', data);

  /** @param {{x:number; y:number}} coords */
  const firing = (coords) => socket.emit('firing', coords);

  const disconnect = () => socket.close();

  return { loadGrid, firing, disconnect, connect_error, anotherPlayerDisconnected, onInitConfig, onUpdate };
};

export { network };
