import { colors } from './Piece.js';
import { MarkerTile } from './assets.js';
import {
  drawGrid,
  drawTileSprite,
  fillRect,
  tileSize
} from './canvas.js';

const HIT = 1;
const WATERSHOT = 2;

class Board {
  constructor(x, y, grid, onclick = (_) => { }) {
    this.x = x;
    this.y = y;
    this.grid = grid || Array.from({ length: 10 }, () => Array(10).fill(0));
    this.onclick = onclick;
    this.selected = false;
  }
  click({ x, y }) {
    return (
      x > this.x * tileSize &&
      x < this.x * tileSize + 10 * tileSize &&
      y > this.y * tileSize &&
      y < this.y * tileSize + 10 * tileSize
    );
  }
  mousedown() {
    this.selected = true;
  }
  mouseup(e) {
    this.onclick({
      x: Math.floor(e.x / tileSize) - this.x,
      y: Math.floor(e.y / tileSize) - this.y,
    });
    this.selected = false;
  }
  draw() {
    drawGrid(this.x, this.y);
    const cells = this.grid.flat();

    cells.forEach((value, index) => {
      const j = index % 10;
      const i = Math.floor(index / 10) % 10;

      let x = (this.x + j) * tileSize;
      let y = (this.y + i) * tileSize;

      if (colors[value]) {
        fillRect(x, y, tileSize, tileSize, colors[value]);
      }

      if (value === WATERSHOT) {
        fillRect(x, y, tileSize, tileSize, '#0000bc88');
      }

      if (value === HIT) {
        drawTileSprite(MarkerTile, x, y, tileSize);
      }
    })
  }
}

export default Board;
