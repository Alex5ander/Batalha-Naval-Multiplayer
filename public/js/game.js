import { network } from './events.js';
import Board from './Board.js';
import BoardEditor from './BoardEditor.js';
import Piece from './Piece.js';
import {
  drawHUD,
  resize,
  fillRect,
  strokeRect,
  tileSize,
  drawTileSprite,
  cols,
  rows,
} from './canvas.js';
import { Crosshair, WaterTile } from './assets.js';

const btnBattle = document.getElementById('btn-batalhar');
const awaitcontainer = document.getElementById('awaitcontainer');
const playGameScreen = document.getElementById('play-game-screen');
const btnPlay = document.getElementById('btn-jogar');
const btnCancel = document.getElementById('btn-cancelar');
const inputPlayerName = document.getElementById('input-player-name');
const form = document.getElementById('form');
const btnRotatePiece = document.getElementById('btn-rotate-piece');

let mx = 0;
let my = 0;

function mouseevents(e) {
  const { offsetLeft, offsetTop, width, height } = canvas;
  const event = {
    mx: Math.floor((e.clientX - offsetLeft) % width),
    my: Math.floor((e.clientY - offsetTop) % height),
    type: e.type,
  };
  mx = event.mx;
  my = event.my;
  events.push(event);
}

function touchevents(e) {
  const { offsetLeft, offsetTop, width, height } = canvas;
  const touch =
    e.type === 'touchend' ? e.changedTouches[0] : e.targetTouches[0];
  const event = {
    mx: Math.floor((touch.clientX - offsetLeft) % width),
    my: Math.floor((touch.clientY - offsetTop) % height),
    type: e.type,
  };
  mx = event.mx;
  my = event.my;
  events.push(event);
}

let objects = [];
let events = [];
/** @type {BoardEditor} */
let editor = null;
/** @type {Board} */
let myboard = null;
/** @type {Board} */
let myhits = null;
let data = null;

let net = null;

export const reseteGame = () => {
  playGameScreen.classList.remove('hidden');
  form.classList.add('hidden');
  awaitcontainer.classList.add('hidden');
  btnRotatePiece.classList.add('hidden');
  objects = [];
  events = [];
  editor = null;
  myboard = null;
  myhits = null;
};

export const onInit = (data) => {
  form.classList.add('hidden');
  btnRotatePiece.classList.add('hidden');

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

const createNetwork = () => network();

const play = (e) => {
  e.preventDefault();
  editor = new BoardEditor(cols / 2 - 5, rows / 2 - 5, (allInBoard) => {
    if (allInBoard === true) {
      form.classList.remove('hidden');
    } else if (allInBoard === false) {
      form.classList.add('hidden');
    }
  });

  const onDrop = (piece) => editor.drop(piece);

  btnRotatePiece.classList.remove('hidden');
  playGameScreen.classList.add('hidden');

  btnRotatePiece.onclick = (e) => {
    e.preventDefault();
    editor.rotatePieceInBoard();
  };

  objects = [
    editor,
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
};

const cancel = (e) => {
  e.preventDefault();
  form.classList.add('hidden');
  awaitcontainer.classList.add('hidden');
  btnRotatePiece.classList.remove('hidden');
  net.disconnect();
};

const battle = (e) => {
  e.preventDefault();
  net = createNetwork();
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
  for (let i = 0; i < 32 * 24; i++) {
    const col = i % 32;
    const row = Math.floor(i / 32);

    drawTileSprite(
      WaterTile,
      col * tileSize,
      row * tileSize,
      tileSize,
      tileSize
    );

    strokeRect(col * tileSize, row * tileSize, tileSize, tileSize, '#fff');
  }
  for (const object of objects) {
    object.draw();
  }

  if (data) {
    drawHUD(data);
  }

  for (const event of events) {
    for (const object of objects) {
      if (object[event.type]) {
        object[event.type](event);
      }
    }
  }

  drawTileSprite(
    Crosshair,
    mx - tileSize / 2,
    my - tileSize / 2,
    tileSize,
    tileSize
  );
  events = [];
  window.requestAnimationFrame(loop);
})();
