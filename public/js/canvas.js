/** @type HTMLCanvasElement */
const canvas = document.getElementById('canvas');
/** @type CanvasRenderingContext2D **/
const ctx = canvas.getContext('2d');
/** @type HTMLDivElement */
const gameArea = document.getElementById('game-area');

let tileSize = 32;

const strokeColor = '#f8f8f8';
const textColor = '#080808';

function fillRect(x, y, w, h, color, angle) {
  ctx.save();
  ctx.translate((x + tileSize / 2) - 0.5, (y + tileSize / 2) - 0.5);
  ctx.rotate(angle);
  ctx.fillStyle = color;
  ctx.fillRect(-tileSize / 2, -tileSize / 2, w, h);
  ctx.restore();
}

function drawTileSprite(img, x, y, size) {
  ctx.drawImage(img, x, y, size, size);
}

function strokeRect(x, y, w, h, color, strokeWidth = 1, angle = 0) {
  ctx.save();
  ctx.lineWidth = strokeWidth;
  ctx.strokeStyle = color;
  ctx.translate((x + tileSize / 2) - 0.5, (y + tileSize / 2) - 0.5);
  ctx.rotate(angle);
  ctx.strokeRect((-tileSize / 2), (-tileSize / 2), w, h);
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
    turn: false,
    end: true,
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

  const active = '#f8f8f8';
  const disabled = '#d8d8d8ff';

  const color1 = room.turn ? active : disabled;
  const color2 = !room.turn ? active : disabled;

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

  document.body.parentElement.style.backgroundSize = tileSize + "px";

  ctx.imageSmoothingEnabled = false;
}

const isPointInPath = (path, x, y) => ctx.isPointInPath(path, x, y);

const drawGrid = (x, y) => {
  var letters = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J'];
  for (var i = 0; i < 10; i++) {
    let fontSize = tileSize / 2;
    let middle = tileSize / 2;

    let numberX = x * tileSize - middle;
    let numberY = (y + i + 1) * tileSize - middle;

    let letterX = (x + i) * tileSize + middle;
    let letterY = (y - 1) * tileSize + middle;

    fillText(i + 1, numberX, numberY, fontSize, textColor);
    fillText(letters[i], letterX, letterY, fontSize, textColor);

    for (var j = 0; j < 10; j++) {

      strokeRect(
        (x + j) * tileSize,
        (y + i) * tileSize,
        tileSize,
        tileSize,
        strokeColor
      );
    }
  }
}

const clearRect = () => ctx.clearRect(0, 0, canvas.width, canvas.height);

export {
  gameArea,
  canvas,
  rows,
  cols,
  resize,
  drawHUD,
  fillRect,
  fillText,
  tileSize,
  strokeRect,
  isPointInPath,
  drawTileSprite,
  drawGrid,
  clearRect
};
