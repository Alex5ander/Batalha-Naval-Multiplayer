import { onInit, onUpdate, reseteGame } from './game.js';

const network = () => {
  const socket = io('/', { reconnection: false });

  socket.on('connect_error', reseteGame);

  socket.on('another_player_disconnected', reseteGame);

  socket.on('init-config', onInit);

  socket.on('update-game', onUpdate);

  const loadGrid = (data) => socket.emit('load-grid', data);

  const firing = (coords) => socket.emit('firing', coords);

  const disconnect = () => socket.close();

  return { loadGrid, firing, disconnect };
};

export { network };
