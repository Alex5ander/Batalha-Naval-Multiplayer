import { network } from './events.js';
import Board from './Board.js';
import BoardEditor from './BoardEditor.js';
import Piece from './Piece.js';
import {
  drawHUD,
  resize,
  tileSize,
  drawTileSprite,
  cols,
  rows,
  drawAnimatedTileSprite,
} from './canvas.js';
import { Crosshair, WaterTile } from './assets.js';

const btnBattle = document.getElementById('btn-battle');
const awaitcontainer = document.getElementById('awaitcontainer');
const playGameScreen = document.getElementById('play-game-screen');
const btnPlay = document.getElementById('btn-play');
const btnCancel = document.getElementById('btn-cancelar');
const inputPlayerName = document.getElementById('input-player-name');
const formBattle = document.getElementById('form-battle');
const boardEditorControls = document.getElementById('board-editor');
const btnRotatePiece = document.getElementById('btn-rotate-piece');
const btnRandomizePiece = document.getElementById('btn-randomize-piece');

let objects = [];
/** @type {BoardEditor} */
let editor = null;
/** @type {Board} */
let myboard = null;
/** @type {Board} */
let myhits = null;
let data = null;

let net = null;

const crosshair = { x: 0, y: 0 };

const handleEvent = (event) => {
  crosshair.x = event.x;
  crosshair.y = event.y;

  const selecteds = objects.filter((e) => e.selected);
  const clicks = objects.filter((e) => e.click(event));

  if (event.type === 'mousemove' || event.type === 'touchmove') {
    for (const selected of selecteds) {
      if (selected[event.type]) {
        selected[event.type](event);
      }
    }
  } else {
    for (const click of clicks) {
      if (click[event.type]) {
        click[event.type](event);
      }
    }
  }
};

function mouseevents(e) {
  e.preventDefault();
  const { offsetLeft, offsetTop, width, height } = canvas;
  const event = {
    x: Math.floor((e.clientX - offsetLeft) % width),
    y: Math.floor((e.clientY - offsetTop) % height),
    type: e.type,
  };
  handleEvent(event);
}

function touchevents(e) {
  const { offsetLeft, offsetTop, width, height } = canvas;
  const touch =
    e.type === 'touchend' ? e.changedTouches[0] : e.targetTouches[0];
  const event = {
    x: Math.floor((touch.clientX - offsetLeft) % width),
    y: Math.floor((touch.clientY - offsetTop) % height),
    type: e.type,
  };
  handleEvent(event);
}

export const reseteGame = () => {
  playGameScreen.classList.remove('hidden');
  formBattle.classList.add('hidden');
  awaitcontainer.classList.add('hidden');
  boardEditorControls.classList.add('hidden');
  objects = [];
  editor = null;
  myboard = null;
  myhits = null;
  data = null;
};

export const onInit = (data) => {
  formBattle.classList.add('hidden');
  boardEditorControls.classList.add('hidden');

  if (data.awaitPlayer2) {
    awaitcontainer.classList.remove('hidden');
  } else {
    awaitcontainer.classList.add('hidden');
  }

  net.loadGrid({ name: inputPlayerName.value, grid: editor.grid });
};

export const onUpdate = (d) => {
  data = d;
  myboard = new Board(2, 5, data.player.grid);
  myhits = new Board(21, 5, data.player.hits, (coords) => net.firing(coords));
  objects = [myboard, myhits];

  if (data.room.end) {
    setTimeout(() => {
      net.disconnect();
      reseteGame();
    }, 5000);
  }

  if (data.room.opponentname) {
    awaitcontainer.classList.add('hidden');
  }
};

const play = (e) => {
  e.preventDefault();
  editor = new BoardEditor(cols / 2 - 5, rows / 2 - 5, (allInBoard) => {
    if (allInBoard === true) {
      formBattle.classList.remove('hidden');
    } else if (allInBoard === false) {
      formBattle.classList.add('hidden');
    }
  });

  const onDrop = (piece) => editor.drop(piece);

  boardEditorControls.classList.remove('hidden');
  playGameScreen.classList.add('hidden');

  const pieces = [
    new Piece(1, 1, 5, 'A', onDrop),

    new Piece(1, 3, 3, 'B', onDrop),
    new Piece(1, 5, 3, 'C', onDrop),

    new Piece(1, 7, 2, 'D', onDrop),
    new Piece(1, 9, 2, 'E', onDrop),
    new Piece(1, 11, 2, 'F', onDrop),

    new Piece(1, 13, 1, 'G', onDrop),
    new Piece(3, 13, 1, 'H', onDrop),
    new Piece(1, 15, 1, 'I', onDrop),
    new Piece(3, 15, 1, 'J', onDrop),
  ];

  btnRotatePiece.onclick = (e) => {
    e.preventDefault();
    editor.rotatePieceInBoard();
  };

  btnRandomizePiece.onclick = (e) => {
    e.preventDefault();
    editor.random(pieces);
  };

  objects = [editor, ...pieces];
};

const cancel = (e) => {
  e.preventDefault();
  formBattle.classList.remove('hidden');
  awaitcontainer.classList.add('hidden');
  boardEditorControls.classList.remove('hidden');
  net.disconnect();
};

const battle = (e) => {
  e.preventDefault();
  net = network();
};

btnBattle.addEventListener('click', battle);
btnCancel.addEventListener('click', cancel);
btnPlay.addEventListener('click', play);

canvas.addEventListener('mousedown', mouseevents);
canvas.addEventListener('mousemove', mouseevents);
canvas.addEventListener('mouseup', mouseevents);

canvas.addEventListener('touchstart', touchevents);
canvas.addEventListener('touchmove', touchevents);
canvas.addEventListener('touchend', touchevents);

window.addEventListener('resize', resize);
window.addEventListener('orientationchange', resize);
resize();

(function loop() {
  const w = Math.floor(canvas.width / tileSize) + 1;
  const h = Math.floor(canvas.height / tileSize) + 1;
  for (let i = 0; i < w * h; i++) {
    const col = i % w;
    const row = Math.floor(i / w);
    drawAnimatedTileSprite(WaterTile, col * tileSize, row * tileSize, tileSize, Math.floor(Date.now() / 500) % 7);
  }
  for (const object of objects) {
    object.draw();
  }

  if (data) {
    drawHUD(data);
  }

  drawTileSprite(
    Crosshair,
    crosshair.x - tileSize / 2,
    crosshair.y - tileSize / 2,
    tileSize
  );

  window.requestAnimationFrame(loop);
})();
