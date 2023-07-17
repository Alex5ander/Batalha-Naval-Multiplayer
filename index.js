const { createServer } = require('http');
const { Server } = require('socket.io');
const express = require('express');

const app = express();
const server = createServer(app);

app.use(express.static('public'));

server.listen(3000, function () {
  console.log(
    '** Server is listening on localhost:3000, open your browser on http://localhost:3000/ **'
  );
});

const io = new Server(server);

let roomsNo = 0;
const game = {};
const maxScore = 21;

class Player {
  /**
   *
   * @param {string} id
   * @param {string} name
   * @param {number[][]} grid
   * @param {Player} opponent
   */
  constructor(id, name, grid, opponent) {
    this.id = id;
    this.name = name.trim() || 'Player#' + Math.random().toString(16);
    this.grid = grid;
    this.hits = Array.from({ length: 10 }, () => Array(10).fill(0));
    this.pieces = {};
    this.drawpieces = [];
    this.score = 0;
    this.opponent = opponent;
  }
}

/**
 *
 * @param {Socket} socket
 * @param {number} roomid
 */
const createRoom = (socket, roomid) => {
  game[roomid] = {
    winner: false,
    turno: socket.id,
    players: [new Player(socket.id, '', [], null)],
  };
};

/**
 *
 * @param {Socket} socket
 * @param {*} data
 * @param {number} roomid
 */
const loadGrid = (socket, data, roomid) => {
  const player = game[roomid].players.find((e) => e.id == socket.id);
  player.name = data.name;
  let count = 0;

  if (Array.isArray(data.grid) && data.grid.length === 10) {
    for (let i = 0; i < data.grid.length; i++) {
      for (let j = 0; j < data.grid[i].length; j++) {
        if (data.grid[i].length === 10) {
          const g = data.grid[i][j];
          if (g === 1) {
            count += 1;
          }
        } else {
          count = 0;
          break;
        }
      }
    }
    if (count !== maxScore) {
      socket.disconnect(0);
    }
  }

  player.grid = data.grid;
  player.pieces = data.pieces;

  if (game[roomid].players.length == 2) {
    updateGame(roomid);
  }
};

/**
 *
 * @param {number} roomid
 */
const updateGame = (roomid) => {
  const room = game[roomid];
  const p1 = game[roomid].players[0];
  const p2 = game[roomid].players[1];
  const updateData = (p1, p2) => ({
    player: {
      name: p1.name,
      grid: p1.grid,
      hits: p1.hits,
      pieces: p1.drawpieces,
    },
    room: {
      opponentname: p2.name,
      winner: room.winner === p1.id,
      turno: room.turno === p1.id,
      end: room.end,
    },
  });
  io.to(p1.id).emit('update-game', updateData(p1, p2));
  io.to(p2.id).emit('update-game', updateData(p2, p1));
};

/**
 *
 * @param {Socket} socket
 * @param {*} coords
 * @param {number} roomid
 */
const firing = (socket, coords, roomid) => {
  const room = game[roomid];
  const player = room.players.find((e) => e.id === socket.id);
  const opponent = player.opponent;
  if (
    coords.x >= 0 &&
    coords.x <= 9 &&
    coords.y >= 0 &&
    coords.y <= 9 &&
    room.winner === false
  ) {
    if (room.turno === socket.id) {
      const targetGrid = opponent.grid;
      if (targetGrid[coords.y][coords.x] === 1) {
        opponent.grid[coords.y][coords.x] = 2;
        player.hits[coords.y][coords.x] = 2;

        if (opponent.pieces[coords.x + coords.y * 10].id) {
          const id = opponent.pieces[coords.x + coords.y * 10].id;
          const piece = opponent.pieces[id];
          piece.count += 1;

          if (piece.count === piece.len) {
            for (let y = 0; y < piece.height; y++) {
              for (let x = 0; x < piece.width; x++) {
                player.drawpieces[piece.x + x + (piece.y + y) * 10] = piece;
              }
            }
          }
        }

        player.score += 1;
        if (player.score === maxScore) {
          room.winner = player.id;
          room.end = true;
        }
      } else if (targetGrid[coords.y][coords.x] === 0) {
        opponent.grid[coords.y][coords.x] = 3;
        player.hits[coords.y][coords.x] = 3;
        room.turno = opponent.id;
      }
    }
    updateGame(roomid);
  }
};

io.on('connection', (socket) => {
  roomsNo += 1;
  const roomid = Math.round(roomsNo / 2);
  socket.join(roomid);

  socket.on('disconnect', () => {
    const room = game[roomid];
    if (room) {
      if (room.players.length === 1) {
        roomsNo -= 1;
      } else {
        io.to(roomid).emit('another_player_disconnected', {
          another_playerid: socket.id,
        });
      }
    }
    delete game[roomid];
  });

  if (roomsNo % 2 === 1) {
    createRoom(socket, roomid);
    socket.emit('init-config', { awaitPlayer2: true });
  } else if (roomsNo % 2 === 0) {
    game[roomid].players.push(
      new Player(socket.id, '', [], game[roomid].players[0])
    );

    game[roomid].players[0].opponent = game[roomid].players[1];
    socket.emit('init-config', { awaitPlayer2: false });
  }
  socket.on('load-grid', (data) => loadGrid(socket, data, roomid));
  socket.on('firing', (data) => firing(socket, data, roomid));
});
