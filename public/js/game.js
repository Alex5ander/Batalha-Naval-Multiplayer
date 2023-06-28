var tileSize = 32;
const btnBatalhar = document.getElementById('btn-batalhar');
const awaitcontainer = document.getElementById('awaitcontainer');
const playGameScreen = document.getElementById('play-game-screen');
const btnJogar = document.getElementById('btn-jogar');
const btnCancelar = document.getElementById('btn-cancelar');
const inputPlayerName = document.getElementById('input-player-name');
const form = document.getElementById('form');
const btnRotatePiece = document.getElementById('btn-rotate-piece');
const gameArea = document.getElementById('game-area');

const cols = 32;
const rows = 24;
const gameAP = cols / rows;

window.addEventListener('resize', resize);
window.addEventListener('orientationchange', resize);
resize();

function resize(e) {
  let newWidth = window.innerWidth;
  let newHeight = window.innerHeight;
  gameArea.style.width = newWidth + 'px';
  gameArea.style.height = newHeight + 'px';
  const asp = newWidth / newHeight;
  if (asp > gameAP) {
    newWidth = window.innerHeight * gameAP;
  } else {
    newHeight = window.innerWidth / gameAP;
  }

  canvas.width = newWidth;
  canvas.height = newHeight;

  tileSize = Math.trunc(Math.max(newWidth, newHeight) / 32);

  ctx.imageSmoothingEnabled = false;
}

btnJogar.onclick = () => game.init(ctx);

function mouseevents(e) {
  const rect = canvas.getBoundingClientRect();
  const coords = {
    subject: game,
    mx: Math.floor(((e.clientX - rect.x) / rect.width) * canvas.width),
    my: Math.floor(((e.clientY - rect.y) / rect.height) * canvas.height),
  };
  const data = Object.assign(e, coords);
  game.events.push(data);
}

function touchevents(e) {
  const rect = canvas.getBoundingClientRect();
  const coords = { subject: game };
  if (e.type === 'touchend') {
    coords.mx = Math.floor(
      ((e.changedTouches[0].clientX - rect.x) / rect.width) * canvas.width
    );
    coords.my = Math.floor(
      ((e.changedTouches[0].clientY - rect.y) / rect.height) * canvas.height
    );
  } else {
    coords.mx = Math.floor(
      ((e.targetTouches[0].clientX - rect.x) / rect.width) * canvas.width
    );
    coords.my = Math.floor(
      ((e.targetTouches[0].clientY - rect.y) / rect.height) * canvas.height
    );
  }
  const data = Object.assign(e, coords);
  game.events.push(data);
}

var game = {
  objects: [],
  events: [],
  ctx: false,
  socket: false,
  data: false,
  myboard: false,
  init: function (ctx) {
    this.ctx = ctx;
    if (this.objects.length === 0) {
      var Editor = new BoardEditor(11, 7);
      btnRotatePiece.classList.remove('hidden');
      btnBatalhar.onclick = function (e) {
        game.network(Editor);
        e.preventDefault();
      };
      btnCancelar.onclick = function (e) {
        if (game.socket) {
          game.socket.close();
          game.socket = false;
        }
        awaitcontainer.classList.add('hidden');
        form.classList.add('hidden');
        btnRotatePiece.classList.remove('hidden');
      };
      this.objects.push(Editor);
      this.objects.push(new Piece(1, 1, 5, '#f83800'));

      this.objects.push(new Piece(1, 3, 3, '#00b800'));
      this.objects.push(new Piece(1, 5, 3, '#00b800'));

      this.objects.push(new Piece(1, 7, 2, '#d8f878'));
      this.objects.push(new Piece(1, 9, 2, '#d8f878'));
      this.objects.push(new Piece(1, 11, 2, '#d8f878'));

      this.objects.push(new Piece(1, 13, 1, '#d800cc'));
      this.objects.push(new Piece(1, 15, 1, '#d800cc'));
      this.objects.push(new Piece(1, 17, 1, '#d800cc'));
      this.objects.push(new Piece(1, 19, 1, '#d800cc'));
      playGameScreen.classList.add('hidden');
      this.update();
    }
  },
  resete: function () {
    this.objects = [];
    playGameScreen.classList.remove('hidden');
    form.classList.add('hidden');
    awaitcontainer.classList.add('hidden');
    btnRotatePiece.classList.add('hidden');
    this.data = false;
    this.myboard = false;
    if (game.socket) {
      game.socket.close();
      game.socket = false;
    }
  },
  network: function (Editor) {
    if (this.socket === false) {
      this.socket = io();
    }
    this.socket.on('connect_error', () => {
      game.resete();
    });
    this.socket.on('another_player_disconnected', () => {
      game.resete();
    });
    this.socket.on('init-config', (data) => {
      this.myboard = new Board(2, 6);
      this.myboard.pieces = Editor.pieces;
      form.classList.add('hidden');
      btnRotatePiece.classList.add('hidden');

      if (data.awaitPlayer2) {
        awaitcontainer.classList.remove('hidden');
      } else {
        awaitcontainer.classList.add('hidden');
      }

      game.socket.emit('load-grid', {
        name:
          inputPlayerName.value.trim() ||
          'Player ' + Math.floor(Math.random() * 100),
        grid: Editor.grid,
        pieces: Editor.pieces,
      });
    });
    this.socket.on('update-game', (data) => {
      if (data.room.end) {
        setTimeout(() => game.resete(), 5000);
      }
      this.data = data;
      this.myboard.grid = this.data.player.grid;
      var myhits = new Board(21, 6, data.player.hits);
      myhits.pieces = data.player.pieces;
      game.objects = [myhits];
      if (data.room.opponentname) {
        awaitcontainer.classList.add('hidden');
      }
    });
  },
  notify: function (e) {
    if (e.type == 'allInBoard') {
      if (e.allInBoard === true) {
        form.classList.remove('hidden');
      } else if (e.allInBoard === false) {
        form.classList.add('hidden');
      }
    } else if (e.type === 'firing') {
      this.firing(e);
    } else {
      var s = { subject: game };
      this.events.push(Object.assign(s, e));
    }
  },
  firing: function (e) {
    if (this.socket && this.data.room.turno) {
      this.socket.emit('firing', e.nc);
    }
  },
  draw: function () {
    fillRect(0, 0, canvas.width, canvas.height, '#f8f8f8');
    for (let i = 0; i < this.objects.length; i++) {
      this.objects[i].draw(this.ctx);
    }

    if (this.data) {
      const { player, room } = this.data;
      this.myboard.draw(this.ctx);
      let turnoName = room.turno ? player.name : room.opponentname;

      const tileCenterY = tileSize / 2;
      const left = 1 + player.name.length / 2;
      const right = cols - (1 + room.opponentname.length / 2);

      fillText(
        player.name,
        left * tileSize,
        2 * tileSize + tileCenterY,
        tileSize,
        '#00b800'
      );
      fillText(
        room.opponentname,
        right * tileSize,
        2 * tileSize + tileCenterY,
        tileSize,
        '#f83800'
      );

      if (room.end) {
        const color = room.winner ? '#00b8007f' : '#f838007f';
        const text = room.winner ? 'Você venceu!' : 'Você perdeu!';

        fillRect(0, 0, canvas.width, canvas.height, color);
        fillText(text, 16 * tileSize, 12 * tileSize, tileSize, '#f8f8f8');
      }

      const color = room.turno ? '#00b800' : '#f83800';
      fillText(
        'Turno: ' + turnoName,
        16 * tileSize,
        1 * tileSize + tileCenterY,
        tileSize / 2,
        color
      );
    }
  },
  update: function () {
    for (let i = 0; i < this.events.length; i++) {
      let e = this.events[i];
      for (let j = 0; j < this.objects.length; j++) {
        if (this.objects[j][e.type]) {
          this.objects[j][e.type](e);
        }
      }
      this.events.splice(i, 1);
      i--;
    }
    this.draw();
    window.requestAnimationFrame(this.update.bind(this));
  },
};

canvas.addEventListener('mousedown', mouseevents);
canvas.addEventListener('mousemove', mouseevents);
canvas.addEventListener('mouseup', mouseevents);

canvas.addEventListener('touchstart', touchevents);
canvas.addEventListener('touchmove', touchevents);
canvas.addEventListener('touchend', touchevents);

btnRotatePiece.onclick = function (e) {
  game.events.push({
    type: 'rotatePieceInBoard',
    subject: game,
  });
};
