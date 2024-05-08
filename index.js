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
let rooms = [];
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
   * @param {string} opponentid
   */
  constructor(id, name, opponentid) {
    this.id = id;
    this.name = name;
    this.grid = Array.from({ length: 10 }, () => Array(10).fill(0));
    this.hits = Array.from({ length: 10 }, () => Array(10).fill(0));
    this.score = 0;
    this.opponentid = opponentid;
    this.pieces = [];
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
    /** @type {string} turn */
    this.turn = "";
    this.player1 = player;
    /** @type {Player} player2 */
    this.player2 = null;
  }
}

/** 
 * @param {string} id
 * @param {Room} room
 */
const getPlayerById = (id, room) => {
  if (room.player1 && room.player1.id == id) {
    return room.player1;
  } else if (room.player2 && room.player2.id == id) {
    return room.player2;
  }
  return null;
}

/**
 *
 * @param {Socket} socket
 * @param {*} data
 * @param {Room} room
 */
const loadGrid = (socket, data, room) => {
  const player = getPlayerById(socket.id, room);
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

    pieces.push({ indexes, tag, life: indexes.length });
  });

  player.grid = data.grid;
  player.pieces = pieces;

  if (room.player1 && room.player2) {
    updateGame(room);
  }
};

/** @param {Room} room */
const updateGame = (room) => {
  const { player1, player2 } = room;
  const updateData = (player1, player2) => ({
    player: {
      name: player1.name,
      grid: player1.grid,
      hits: player1.hits,
    },
    room: {
      opponentname: player2.name,
      winner: room.winner === player1.id,
      turn: room.turn === player1.id,
      end: room.end,
    },
  });
  io.to(player1.id).emit('update_game', updateData(player1, player2));
  io.to(player2.id).emit('update_game', updateData(player2, player1));
};

/**
 *
 * @param {Socket} socket
 * @param {*} coords
 * @param {Room} room
 */
const firing = (socket, coords, room) => {
  const player = getPlayerById(socket.id, room);
  const opponent = getPlayerById(player.opponentid, room);
  const targetGrid = opponent.grid;
  if (
    coords.x >= 0 &&
    coords.x <= 9 &&
    coords.y >= 0 &&
    coords.y <= 9 &&
    room.winner === false
  ) {
    if (room.turn === socket.id) {
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
        room.turn = opponent.id;
      }
      updateGame(room);
    }
  }
};

/** 
 * @param {Socket} socket
 * @param {Room} room 
 * */
const onDisconnect = (socket, room) => {
  if (room) {
    let player = getPlayerById(socket.id, room);
    rooms = rooms.filter((e) => e.id !== room.id);
    if (!room.winner) {
      io.to(room.id).emit('opponent_disconnected', player.name);
    }
  }
}

io.use((socket, next) => {
  if (socket.handshake.auth.name && socket.handshake.auth.name.trim().length > 2) {
    next();
  } else {
    next(new Error('player name invalid'))
  }
})

io.on('connection', (socket) => {
  let room = rooms.find((e) => e.player2 == null);
  let playername = socket.handshake.auth.name.trim().substring(0, 20);

  if (room) {
    socket.join(room.id);
    room.player2 = new Player(socket.id, playername, room.player1.id);
    room.player1.opponentid = room.player2.id;
    room.turn = Math.floor(Math.random() * 2) == 0 ? room.player1.id : room.player2.id;
    socket.emit('join', { awaitPlayer2: false });
  } else {
    room = new Room(new Player(socket.id, playername, [], null));
    socket.join(room.id);
    rooms.push(room);
    socket.emit('join', { awaitPlayer2: true });
  }

  socket.on('disconnect', () => onDisconnect(socket, room));
  socket.on('load_grid', (data) => loadGrid(socket, data, room));
  socket.on('firing', (data) => firing(socket, data, room));
});