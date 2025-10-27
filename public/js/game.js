import { network } from './network.js';
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
  fillRect,
  fillText,
  canvas,
  clearRect,
} from './canvas.js';
import { Crosshair, loadAssets } from './assets.js';

let playerName = "";
/** @type {BoardEditor} */
export let editor = null;
/** @type {Board} */
let myboard = null;
/** @type {Board} */
let myhits = null;
let data = null;
let status = { time: 0, text: "" };
let net = null;
const crosshair = { x: 0, y: 0 };
/** @type {Piece} */
export let lastPiece = null;

/**@param {Piece} piece  */
export const setLastPiece = (piece) => { lastPiece = piece; }

const handleEvent = (event) => {
  crosshair.x = event.x;
  crosshair.y = event.y;

  if (editor && net == null) {
    editor.pieces.forEach(piece => {
      if (piece[event.type]) {
        piece[event.type](event);
      }
    })
  }

  if (myhits) {
    if (myhits[event.type]) {
      myhits[event.type](event);
    }
  }
}

const getCoords = (_x, _y) => {
  const { offsetLeft, offsetTop, width, height } = canvas;
  let tx = Math.floor(_x - offsetLeft);
  let ty = Math.floor(_y - offsetTop);
  let x = tx < 0 ? 0 : tx > width ? width : tx;
  let y = ty < 0 ? 0 : ty > height ? height : ty;
  return { x, y };
}

const mouseevents = (e) => {
  e.preventDefault();
  const { x, y } = getCoords(e.clientX, e.clientY);
  handleEvent({ x, y, type: e.type });
}

const touchevents = (e) => {
  const touch =
    e.type === 'touchend' ? e.changedTouches[0] : e.targetTouches[0];
  const { x, y } = getCoords(touch.clientX, touch.clientY);
  handleEvent({ x, y, type: e.type, });
}

export const setPlayerName = (value) => { playerName = value };

export const play = (e) => {
  e.preventDefault();
  editor = new BoardEditor(cols / 2 - 5, rows / 2 - 5);
  lastPiece = null;
};

export const cancel = (e) => {
  e.preventDefault();
  net.disconnect();
  net = null;
};

export const listener = {
  /** @param {{ awaitPlayer2: boolean }} _ */
  onJoin: (_) => { },
  onEnd: () => { },
  onStart: () => { },
  onResetGame: () => { },
  onLoadAssets: () => { }
}

export const resetGame = () => {
  editor = null;
  myboard = null;
  myhits = null;
  data = null;
  net.disconnect();
  net = null;
  listener.onResetGame();
};

const onOpponentDisconnected = (opponentname) => {
  status = { time: Date.now(), text: "Jogador " + opponentname + " desconectou" };
  resetGame();
}

/** @param {{ awaitPlayer2: boolean }} message */
const onJoin = (message) => {
  net.loadGrid({ grid: editor.grid });
  listener.onJoin(message)
}

const onUpdate = (message) => {
  data = message;
  if (!myboard && !myhits) {
    myboard = new Board(2, 5, data.player.grid);
    myhits = new Board(21, 5, data.player.hits, (coords) => net.firing(coords));
    editor = null;
  }

  myboard.grid = data.player.grid;
  myhits.grid = data.player.hits;

  if (data.room.end) {
    listener.onEnd();
  }
};

export const battle = (e) => {
  e.preventDefault();
  if (net == null) {
    lastPiece = null;
    net = network(playerName);
    net.onUpdate(onUpdate);
    net.connect_error(e => { console.log(e); net = null; });
    net.onJoin(onJoin);
    net.onOpponentDisconnected(onOpponentDisconnected);
    net.onStart(listener.onStart);
  }
};

function loop() {
  clearRect();
  let now = Date.now();

  if (editor) {
    editor.draw();
  }

  if (myhits) {
    myhits.draw();
  }

  if (myboard) {
    myboard.draw();
  }

  if (lastPiece) {
    let alpha = (Math.sin(2 * Math.PI * (((now / 1000) % 2) / 2)) + 1) / 4;
    let color = `rgba(255, 255, 255, ${alpha})`;
    fillRect(
      lastPiece.x * tileSize,
      lastPiece.y * tileSize,
      lastPiece.len * tileSize,
      tileSize,
      color,
      lastPiece.angle
    );
  }

  if (data) {
    drawHUD(data);
  }

  if (now - status.time <= 5000) {
    let alpha = 1 - ((now - status.time) / 5000);
    let color = `rgba(255, 255, 255, ${alpha})`;
    fillText(status.text, canvas.width / 2, canvas.height - 20, tileSize / 2, color);
  }

  drawTileSprite(
    Crosshair,
    crosshair.x - tileSize / 2,
    crosshair.y - tileSize / 2,
    tileSize
  );

  window.requestAnimationFrame(loop);
}

const start = async () => {
  listener.onLoadAssets();
  canvas.addEventListener('mousedown', mouseevents);
  window.addEventListener('mousemove', mouseevents);
  canvas.addEventListener('mouseup', mouseevents);

  canvas.addEventListener('touchstart', touchevents, { passive: true });
  canvas.addEventListener('touchmove', touchevents, { passive: true });
  canvas.addEventListener('touchend', touchevents);

  window.addEventListener('resize', resize);
  window.addEventListener('orientationchange', resize);
  resize();
  loop(0);
}

loadAssets(start);