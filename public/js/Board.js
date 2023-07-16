import {
  drawTileSprite,
  fillRect,
  fillText,
  strokeRect,
  tileSize,
} from './canvas.js';

const waterTile = new Image();
waterTile.src = '../images/watertile.png';

const markerTile = new Image();
markerTile.src = '../images/markertile.png';

class Board {
  constructor(x, y, grid, onclick = (_) => {}) {
    this.x = x;
    this.y = y;
    this.pieces = {};
    this.grid = grid || [
      [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    ];
    this.onclick = onclick;
    this.selected = false;
  }
  click(x, y) {
    if (
      x > this.x * tileSize &&
      x < this.x * tileSize + 10 * tileSize &&
      y > this.y * tileSize &&
      y < this.y * tileSize + 10 * tileSize
    ) {
      return true;
    }
    return false;
  }
  mousedown(e) {
    if (this.click(e.mx, e.my) === true) {
      this.selected = true;
    }
  }
  mouseup(e) {
    var nc = {
      x: Math.floor(e.mx / tileSize) - this.x,
      y: Math.floor(e.my / tileSize) - this.y,
    };
    if (this.click(e.mx, e.my) === true && this.selected === true) {
      this.onclick(nc);
    }
    this.selected = false;
  }
  draw() {
    var letters = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J'];
    for (let i = 0; i < 32 * 24; i++) {
      const col = i % 32;
      const row = Math.floor(i / 32);
      strokeRect(col * tileSize, row * tileSize, tileSize, tileSize, '#080808');
    }

    const cols = 10;
    const size = this.grid.length * cols;

    for (var i = 0; i < size; i++) {
      const col = i % cols;
      const row = Math.floor(i / cols);
      drawTileSprite(
        waterTile,
        (this.x + col) * tileSize,
        (this.y + row) * tileSize,
        tileSize
      );
    }

    for (var i in this.pieces) {
      if (this.pieces[i]) {
        var p = this.pieces[i];
        fillRect(
          (this.x + p.lx) * tileSize,
          (this.y + p.ly) * tileSize,
          p.width * tileSize,
          p.height * tileSize,
          p.color
        );
      }
    }

    for (var i = 0; i < this.grid.length; i++) {
      let fontSize = tileSize / 2;

      let nx = this.x * tileSize - tileSize / 2;
      let ny = this.y * tileSize + i * tileSize + fontSize;

      let lx = (this.x + i) * tileSize + tileSize / 2;
      let ly = this.y * tileSize - fontSize;

      fillText(i + 1, nx, ny, fontSize, '#080808');
      fillText(letters[i], lx, ly, fontSize, '#080808');

      for (var j = 0; j < this.grid[i].length; j++) {
        var g = this.grid[i][j];

        if (g === 3) {
          fillRect(
            (this.x + j) * tileSize,
            (this.y + i) * tileSize,
            tileSize,
            tileSize,
            '#0000bc'
          );
        }

        if (g === 2) {
          drawTileSprite(
            markerTile,
            (this.x + j) * tileSize,
            (this.y + i) * tileSize,
            tileSize
          );
        }

        strokeRect(
          (this.x + j) * tileSize,
          (this.y + i) * tileSize,
          tileSize,
          tileSize,
          '#3cbcfcff'
        );
      }
    }
  }
}

export default Board;
