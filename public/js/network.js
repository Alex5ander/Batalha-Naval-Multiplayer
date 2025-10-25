/** @param {string} name */
const network = (name) => {
  const socket = io(window.location.href, { reconnection: false, auth: { name } });

  const connect_error = (callback) => socket.on('connect_error', callback);

  const onOpponentDisconnected = (callback) => socket.on('opponent_disconnected', callback);

  const onJoin = (callback) => socket.on('join', callback);

  const onUpdate = (callback) => socket.on('update_game', callback);

  /** @param {{name: string; grid: number[][] }} data */
  const loadGrid = (data) => socket.emit('load_grid', data);

  /** @param {{x:number; y:number}} coords */
  const firing = (coords) => socket.emit('firing', coords);

  const disconnect = () => socket.close();

  const onStart = (callback) => socket.on('start', callback);

  return { loadGrid, firing, disconnect, connect_error, onOpponentDisconnected, onJoin, onUpdate, onStart };
};

export { network };
