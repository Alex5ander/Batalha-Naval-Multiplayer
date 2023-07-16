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
const rows = 24;

function drawHUD(data) {
  const { player, room } = data;
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

const gameAP = cols / rows;

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
};
