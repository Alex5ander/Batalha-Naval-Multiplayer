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
  fillRect,
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
/** @type {Piece} */
let lastPiece = null;

const handleEvent = (event) => {
  crosshair.x = event.x;
  crosshair.y = event.y;

  for (let object of objects) {
    if (object[event.type]) {
      object[event.type](event);
    }
  }
}


const mouseevents = (e) => {
  e.preventDefault();
  const { offsetLeft, offsetTop, width, height } = canvas;
  const event = {
    x: Math.floor((e.clientX - offsetLeft) % width),
    y: Math.floor((e.clientY - offsetTop) % height),
    type: e.type,
  };
  handleEvent(event);
}

const touchevents = (e) => {
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

  lastPiece = null;

  const onPointerUp = (piece) => {
    editor.drop(piece);
    lastPiece = piece.inBoard ? piece : null;
    btnRotatePiece.disabled = lastPiece == null;
  }

  const onPointerDown = (_) => {
    lastPiece = null;
    btnRotatePiece.disabled = true;
  }

  boardEditorControls.classList.remove('hidden');
  playGameScreen.classList.add('hidden');

  const pieces = [
    new Piece(1, 1, 5, 'A', onPointerDown, onPointerUp),

    new Piece(1, 3, 3, 'B', onPointerDown, onPointerUp),
    new Piece(1, 5, 3, 'C', onPointerDown, onPointerUp),

    new Piece(1, 7, 2, 'D', onPointerDown, onPointerUp),
    new Piece(1, 9, 2, 'E', onPointerDown, onPointerUp),
    new Piece(1, 11, 2, 'F', onPointerDown, onPointerUp),

    new Piece(1, 13, 1, 'G', onPointerDown, onPointerUp),
    new Piece(3, 13, 1, 'H', onPointerDown, onPointerUp),
    new Piece(1, 15, 1, 'I', onPointerDown, onPointerUp),
    new Piece(3, 15, 1, 'J', onPointerDown, onPointerUp),
  ];

  btnRotatePiece.onclick = (e) => {
    e.preventDefault();
    if (lastPiece) {
      editor.rotatePieceInBoard(lastPiece);
      lastPiece = lastPiece.inBoard ? lastPiece : null;
      btnRotatePiece.disabled = lastPiece == null;
    }
  };

  btnRandomizePiece.onclick = (e) => {
    e.preventDefault();
    editor.random(pieces);
    lastPiece = null;
    btnRotatePiece.disabled = true;
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

  if (lastPiece) {
    let alpha = (Math.sin(2 * Math.PI * (((Date.now() / 1000) % 2) / 2)) + 1) / 2;
    let color = `rgba(255, 255, 255, ${alpha})`;
    fillRect(
      lastPiece.x * tileSize,
      lastPiece.y * tileSize,
      lastPiece.width * tileSize,
      lastPiece.height * tileSize,
      color,
    );
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
