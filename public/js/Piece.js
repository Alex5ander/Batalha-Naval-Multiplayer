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
  constructor(x, y, len, tag, onDrop = (_) => { }) {
    this.tag = tag;
    this.x = x;
    this.y = y;
    this.startX = x;
    this.startY = y;
    this.boardX = null;
    this.boardY = null;
    this.inBoard = false;
    this.width = len;
    this.height = 1;
    this.len = len;
    this.selected = false;
    this.onDrop = onDrop;
    this.startMouse = { x: 0, y: 0 };
    this.interpolation = { active: false, x: 0, y: 0, onEnd: () => { } };
  }
  click(e) {
    var path = new Path2D();
    path.rect(
      this.x * tileSize,
      this.y * tileSize,
      this.width * tileSize,
      this.height * tileSize
    );
    return isPointInPath(path, e.x, e.y);
  }
  resete() {
    this.width = this.len;
    this.height = 1;
    this.inBoard = false;
    this.boardX = null;
    this.boardY = null;
    this.interpolate(this.startX, this.startY);
  }
  interpolate(x, y, end = () => { }) {
    this.interpolation.active = true;
    this.interpolation.x = x;
    this.interpolation.y = y;
    this.interpolation.onEnd = end
  }
  rotate() {
    let w = this.width;
    let h = this.height;
    this.width = h;
    this.height = w;
  }
  mousedown(e) {
    this.interpolation.active = false;
    this.selected = true;
    this.startMouse = { x: e.x, y: e.y }
  }
  mouseup() {
    this.onDrop(this);
    this.selected = false;
  }
  mousemove(e) {
    if (this.selected) {
      this.x += (e.x - this.startMouse.x) / tileSize
      this.y += (e.y - this.startMouse.y) / tileSize;
      this.startMouse = { x: e.x, y: e.y };
    }
  }
  touchstart(e) {
    this.interpolation.active = false;
    this.selected = true;
    this.startMouse = { x: e.x, y: e.y }
  }
  touchend(e) {
    this.onDrop(this);
    this.selected = false;
  }
  touchmove(e) {
    if (this.selected) {
      this.x += (e.x - this.startMouse.x) / tileSize
      this.y += (e.y - this.startMouse.y) / tileSize;
      this.startMouse = { x: e.x, y: e.y };
    }
  }
  draw() {
    if (this.interpolation.active) {
      this.x += (this.interpolation.x - this.x) * 0.1;
      this.y += (this.interpolation.y - this.y) * 0.1;
      let distance = Math.sqrt(Math.pow((this.interpolation.x - this.x), 2) - Math.pow((this.interpolation.y - this.y), 2));
      if (distance < 0.1) {
        this.x = this.interpolation.x;
        this.y = this.interpolation.y;
        this.interpolation.active = false;
        this.interpolation.onEnd();
        this.interpolation.onEnd = () => { }
      }
    }

    fillRect(
      this.x * tileSize,
      this.y * tileSize,
      this.width * tileSize,
      this.height * tileSize,
      colors[this.tag]
    );

    strokeRect(
      this.x * tileSize,
      this.y * tileSize,
      this.width * tileSize,
      this.height * tileSize,
      '#080808',
      2.5
    );

    if (this.selected === true) {
      strokeRect(
        this.x * tileSize,
        this.y * tileSize,
        this.width * tileSize,
        this.height * tileSize,
        '#fca044',
        2
      );
    }
  }
}

export default Piece;
