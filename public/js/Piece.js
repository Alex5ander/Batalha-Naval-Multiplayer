import { fillRect, isPointInPath, strokeRect, tileSize } from './canvas.js';

export const colors = {
  A: '#f83800',
  B: '#00b800',
  C: '#00b800',
  D: '#d8f878',
  E: '#d8f878',
  F: '#d8f878',
  G: '#d800cc',
  H: '#d800cc',
  I: '#d800cc',
  J: '#d800cc',
};

class Piece {
  constructor(x, y, len, tag, onDrop = (_) => {}) {
    this.tag = tag;
    this.x = x;
    this.y = y;
    this.count = 0;
    this.startX = x;
    this.startY = y;
    this.inBoardX = null;
    this.inBoardY = null;
    this.inBoard = false;
    this.width = len;
    this.height = 1;
    this.len = len;
    this.selected = false;
    this.onDrop = onDrop;
  }
  click(e) {
    var path = new Path2D();
    path.rect(
      this.x * tileSize,
      this.y * tileSize,
      this.width * tileSize,
      this.height * tileSize
    );
    if (isPointInPath(path, e.mx, e.my)) {
      return true;
    }
    return false;
  }
  resete() {
    this.x = this.startX;
    this.y = this.startY;
    this.width = this.len;
    this.height = 1;
    this.inBoard = false;
    this.inBoardX = null;
    this.inBoardY = null;
  }
  mousedown(e) {
    if (this.click(e)) {
      this.selected = true;
    }
  }
  mouseup(e) {
    if (this.click(e)) {
      this.onDrop(this);
    }
    this.selected = false;
  }
  mousemove(e) {
    if (this.selected) {
      this.x = (e.mx - (this.width * tileSize) / 2) / tileSize;
      this.y = (e.my - (this.height * tileSize) / 2) / tileSize;
    }
  }
  touchstart(e) {
    if (this.click(e)) {
      this.selected = true;
    }
  }
  touchend(e) {
    if (this.click(e)) {
      this.onDrop(this);
    }
    this.selected = false;
  }
  touchmove(e) {
    if (this.selected) {
      this.x = (e.mx - (this.width * tileSize) / 2) / tileSize;
      this.y = (e.my - (this.height * tileSize) / 2) / tileSize;
    }
  }
  draw() {
    fillRect(
      this.x * tileSize,
      this.y * tileSize,
      this.width * tileSize,
      this.height * tileSize,
      colors[this.tag]
    );
    if (this.selected === true) {
      strokeRect(
        this.x * tileSize,
        this.y * tileSize,
        this.width * tileSize,
        this.height * tileSize,
        '#080808',
        2
      );
    } else if (this.inBoard) {
      strokeRect(
        this.x * tileSize,
        this.y * tileSize,
        this.width * tileSize,
        this.height * tileSize,
        '#080808',
        2.5
      );
    }
  }
}

export default Piece;
