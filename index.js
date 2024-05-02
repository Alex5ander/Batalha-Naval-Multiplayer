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

/** @type {Room[]} */
let game = [];
const maxScore = 21;
const tags = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J'];
const WATER = 0;
const HIT = 1;
const WATERSHOT = 2;

class Player {
  /**
   *
   * @param {string} id
   * @param {string} name
   * @param {number[][]} grid
   * @param {string} opponentid
   */
  constructor(id, name, grid, opponentid) {
    this.id = id;
    this.name = name;
    this.grid = grid;
    this.hits = Array.from({ length: 10 }, () => Array(10).fill(0));
    this.score = 0;
    this.opponentid = opponentid;
    this.pieces = [];
  }
  /** @param {string} name */
  setName(name) {
    this.name = name.trim()
  }
}

class Room {
  /**
   *
   * @param {Player} player
   */
  constructor(player) {
    this.id = Math.floor(Math.random() * 127).toString(16) + Date.now();
    this.winner = false;
    this.turno = player.id;
    this.players = [player];
  }
}

/**
 *
 * @param {Socket} socket
 * @param {*} data
 * @param {Room} room
 */
const loadGrid = (socket, data, room) => {
  const player = room.players.find((e) => e.id == socket.id);
  player.setName(data.name);
  let count = 0;

  if (Array.isArray(data.grid) && data.grid.length === 10) {
    for (let i = 0; i < data.grid.length; i++) {
      for (let j = 0; j < data.grid[i].length; j++) {
        if (data.grid[i].length === 10) {
          const g = data.grid[i][j];
          if (g !== 0) {
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

  let pieces = [];
  const flatGrid = [];

  for (let i = 0; i < 100; i++) {
    const x = i % 10;
    const y = Math.floor(i / 10);
    flatGrid.push(data.grid[y][x]);
  }

  tags.forEach((tag) => {
    const indexes = flatGrid
      .map((e, i) => (e == tag ? i : -1))
      .filter((e) => e != -1);

    pieces.push({
      indexes,
      tag,
      life: indexes.length,
    });
  });

  player.grid = data.grid;
  player.pieces = pieces;

  if (room.players.length == 2) {
    updateGame(room);
  }
};

/** @param {Room} room */
const updateGame = (room) => {
  const p1 = room.players[0];
  const p2 = room.players[1];
  const updateData = (p1, p2) => ({
    player: {
      name: p1.name,
      grid: p1.grid,
      hits: p1.hits,
    },
    room: {
      opponentname: p2.name,
      winner: room.winner === p1.id,
      turno: room.turno === p1.id,
      end: room.end,
    },
  });
  io.to(p1.id).emit('update_game', updateData(p1, p2));
  io.to(p2.id).emit('update_game', updateData(p2, p1));
};

/**
 *
 * @param {Socket} socket
 * @param {*} coords
 * @param {Room} room
 */
const firing = (socket, coords, room) => {
  const player = room.players.find((e) => e.id === socket.id);
  const opponent = room.players.find((e) => e.id == player.opponentid);
  const targetGrid = opponent.grid;
  if (
    coords.x >= 0 &&
    coords.x <= 9 &&
    coords.y >= 0 &&
    coords.y <= 9 &&
    room.winner === false
  ) {
    if (room.turno === socket.id) {
      if (tags.includes(targetGrid[coords.y][coords.x])) {
        targetGrid[coords.y][coords.x] = HIT;
        player.hits[coords.y][coords.x] = HIT;

        const piece = opponent.pieces.find((piece) =>
          piece.indexes.includes(coords.x + coords.y * 10)
        );

        piece.life -= 1;
        if (piece.life === 0) {
          piece.indexes.forEach((e) => {
            const x = e % 10;
            const y = Math.floor(e / 10);
            player.hits[y][x] = piece.tag;
          });
        }

        player.score += 1;

        if (player.score === maxScore) {
          room.winner = player.id;
          room.end = true;
        }
      } else if (targetGrid[coords.y][coords.x] === WATER) {
        targetGrid[coords.y][coords.x] = WATERSHOT;
        player.hits[coords.y][coords.x] = WATERSHOT;
        room.turno = opponent.id;
      }
    }
    updateGame(room);
  }
};

io.on('connection', (socket) => {
  let room = game.find((e) => e.players.length === 1);

  if (room) {
    socket.join(room.id);
    room.players.push(new Player(socket.id, '', [], room.players[0].id));
    room.players[0].opponentid = room.players[1].id;
    socket.emit('init_config', { awaitPlayer2: false });
  } else {
    room = new Room(new Player(socket.id, '', [], null));
    socket.join(room.id);
    game.push(room);
    socket.emit('init_config', { awaitPlayer2: true });
  }

  socket.on('disconnect', () => {
    const currentRoom = game.find((e) =>
      e.players.find((p) => socket.id === p.id)
    );

    if (currentRoom) {
      game = game.filter((e) => e.id !== currentRoom.id);
      if (!currentRoom.winner) {
        io.to(currentRoom.id).emit('another_player_disconnected');
      }
    }
  });

  socket.on('load_grid', (data) => loadGrid(socket, data, room));
  socket.on('firing', (data) => firing(socket, data, room));
});
