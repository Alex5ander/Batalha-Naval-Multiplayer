/** @type HTMLCanvasElement */
const canvas = document.getElementById('canvas');
/** @type CanvasRenderingContext2D **/
const ctx = canvas.getContext('2d');
/** @type HTMLDivElement */
const gameArea = document.getElementById('game-area');

let tileSize = 32;

function fillRect(x, y, w, h, color) {
  ctx.fillStyle = color;
  ctx.fillRect(x, y, w, h);
}

function drawTileSprite(img, x, y, size) {
  ctx.drawImage(img, x, y, size, size);
}

function strokeRect(x, y, w, h, color, strokeWidth) {
  ctx.save();
  ctx.lineWidth = strokeWidth || 0.5;
  ctx.strokeStyle = color;
  ctx.strokeRect(x, y, w, h);
  ctx.restore();
}

function fillText(text, x, y, fontSize, color) {
  ctx.save();
  ctx.textBaseline = 'middle';
  ctx.textAlign = 'center';
  ctx.font = fontSize + "px 'Press Start 2P'";
  ctx.fillStyle = color;
  ctx.fillText(text, x, y);
  ctx.restore();
}

const cols = 32;
const rows = 18;

const DATA = {
  player: {
    name: 'Player',
  },
  room: {
    opponentname: 'Player',
    winner: false,
    turno: false,
    end: false,
  },
};
/**
 *
 * @param {DATA} data
 */
function drawHUD(data = DATA) {
  const { player, room } = data;

  const fontSize = tileSize / 2;
  const lineY = 3 * tileSize;
  const y = lineY - fontSize;

  const x0 = 7 * tileSize;
  const x1 = 26 * tileSize;

  const color1 = room.turno ? '#fff' : '#bbb';
  const color2 = !room.turno ? '#fff' : '#bbb';

  fillText(player.name, x0, y, fontSize, color1);
  fillText(room.opponentname, x1, y, fontSize, color2);

  ctx.save();
  ctx.beginPath();
  ctx.strokeStyle = color1;
  ctx.lineWidth = 10;
  ctx.lineCap = 'round';
  ctx.moveTo(2 * tileSize, lineY);
  ctx.lineTo(12 * tileSize, lineY);
  ctx.stroke();

  ctx.beginPath();
  ctx.strokeStyle = color2;
  ctx.lineWidth = 10;
  ctx.lineCap = 'round';
  ctx.moveTo(21 * tileSize, lineY);
  ctx.lineTo(31 * tileSize, lineY);
  ctx.stroke();
  ctx.restore();

  if (room.end) {
    const color = room.winner ? '#00b8007f' : '#f838007f';
    const text = room.winner ? 'Você venceu!' : 'Você perdeu!';

    fillRect(0, 0, canvas.width, canvas.height, color);
    fillText(text, canvas.width / 2, canvas.height / 2, tileSize, '#f8f8f8');
  }
}

const gameAP = cols / rows;

function resize(_) {
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

const isPointInPath = (a, b, c) => ctx.isPointInPath(a, b, c);

export {
  isPointInPath,
  drawHUD,
  fillText,
  fillRect,
  strokeRect,
  drawTileSprite,
  resize,
  tileSize,
  rows,
  cols,
};
