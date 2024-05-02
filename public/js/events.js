import { AnotherPlayerDisconnected, onInit, onUpdate, reseteGame } from './game.js';

const network = () => {
  const socket = io();

  socket.on('connect_error', reseteGame);

  socket.on('another_player_disconnected', AnotherPlayerDisconnected);

  socket.on('init_config', onInit);

  socket.on('update_game', onUpdate);

  /** @param {{name: string; grid: number[][] }} data */
  const loadGrid = (data) => socket.emit('load_grid', data);

  /** @param {{x:number; y:number}} coords */
  const firing = (coords) => socket.emit('firing', coords);

  const disconnect = () => socket.close();

  return { loadGrid, firing, disconnect };
};

export { network };
