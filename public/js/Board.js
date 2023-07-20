import { colors } from './Piece.js';
import { MarkerTile, WaterTile } from './assets.js';
import {
  drawTileSprite,
  fillRect,
  fillText,
  strokeRect,
  tileSize,
} from './canvas.js';

class Board {
  constructor(x, y, grid, onclick = (_) => {}) {
    this.x = x;
    this.y = y;
    this.grid = grid || Array.from({ length: 10 }, () => Array(10).fill(0));
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

    const cols = 10;
    const size = this.grid.length * cols;

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

        if (colors[g]) {
          fillRect(
            (this.x + j) * tileSize,
            (this.y + i) * tileSize,
            tileSize,
            tileSize,
            colors[g]
          );
        }

        if (g === 2) {
          fillRect(
            (this.x + j) * tileSize,
            (this.y + i) * tileSize,
            tileSize,
            tileSize,
            '#0000bc'
          );
        }

        if (g === 1) {
          drawTileSprite(
            MarkerTile,
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
          '#f8f8f8'
        );
      }
    }
  }
}

export default Board;
