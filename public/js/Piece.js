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
  constructor(x, y, len, tag, onPointerDown = (_) => { }, onPointerUp = (_) => { }) {
    this.tag = tag;
    this.x = x;
    this.y = y;
    this.startX = x;
    this.startY = y;
    this.boardX = null;
    this.boardY = null;
    this.inBoard = false;
    this.len = len;
    this.selected = false;
    this.onPointerDown = onPointerDown;
    this.onPointerUp = onPointerUp;
    this.startMouse = { x: 0, y: 0 };
    this.interpolation = { active: false, x: 0, y: 0, angle: 0, onEnd: () => { } };
    this.angle = 0;
    this.dx = 1;
    this.dy = 0;
  }
  click(e) {
    const path = new Path2D();
    let x = this.x * tileSize;
    let y = this.y * tileSize;
    path.rect(x, y, this.len * tileSize, tileSize);
    let p2 = new Path2D();
    p2.addPath(path, new DOMMatrix().translate(x + tileSize / 2, y + tileSize / 2).
      rotate(this.angle * 180 / Math.PI).translate(-(x + tileSize / 2), -(y + tileSize / 2)));
    return isPointInPath(p2, e.x, e.y);
  }
  resete() {
    this.angle = 0;
    this.dx = Math.floor(Math.cos(this.angle));
    this.dy = Math.floor(Math.sin(this.angle));
    this.inBoard = false;
    this.boardX = null;
    this.boardY = null;
    this.interpolate(this.startX, this.startY);
  }
  interpolate(x, y, angle = 0, end = () => { }) {
    this.interpolation.active = true;
    this.interpolation.x = x;
    this.interpolation.y = y;
    this.interpolation.angle = angle;
    this.interpolation.onEnd = end;
  }
  rotate() {
    if (!this.interpolation.active) {
      let angle = this.angle + Math.PI / 2;

      this.interpolate(this.x, this.y, angle);

      angle = angle == 3 * Math.PI / 2 ? -Math.PI / 2 : angle;
      angle = angle == 2 * Math.PI ? 0 : angle;

      this.dx = Math.floor(Math.cos(angle));
      this.dy = Math.floor(Math.sin(angle));
    }
  }
  d(e) {
    this.interpolation.active = false;
    this.selected = true;
    this.startMouse = { x: e.x, y: e.y }
    this.onPointerDown(this);
  }
  u(e) {
    this.selected = false;
    this.onPointerUp(this);
  }
  m(e) {
    this.x += (e.x - this.startMouse.x) / tileSize
    this.y += (e.y - this.startMouse.y) / tileSize;
    this.startMouse = { x: e.x, y: e.y };
  }
  mousedown(e) {
    if (this.click(e)) {
      this.d(e);
    }
  }
  mouseup(e) {
    if (this.click(e) && this.selected) {
      this.u(e);
    }
  }
  mousemove(e) {
    if (this.selected) {
      this.m(e);
    }
  }
  touchstart(e) {
    if (this.click(e)) {
      this.d(e);
    }
  }
  touchend(e) {
    if (this.click(e) && this.selected) {
      this.u(e);
    }
  }
  touchmove(e) {
    if (this.selected) {
      this.m(e);
    }
  }
  draw() {
    if (this.interpolation.active) {
      this.x += (this.interpolation.x - this.x) * 0.1;
      this.y += (this.interpolation.y - this.y) * 0.1;
      let distance = Math.sqrt(Math.pow(this.interpolation.x - this.x, 2) + Math.pow(this.interpolation.y - this.y, 2));

      this.angle += (this.interpolation.angle - this.angle) * 0.1;
      let diffangle = Math.abs(this.interpolation.angle - this.angle);

      if (distance < 0.1 && diffangle < 0.1) {
        this.x = this.interpolation.x;
        this.y = this.interpolation.y;

        this.angle = this.interpolation.angle == 2 * Math.PI ? 0 : this.interpolation.angle;
        this.interpolation.angle = this.angle;
        this.interpolation.active = false;
        this.interpolation.onEnd();
        this.interpolation.onEnd = () => { }
      }
    }

    let x = this.x * tileSize;
    let y = this.y * tileSize;
    let w = this.len * tileSize;

    fillRect(
      x,
      y,
      w,
      tileSize,
      colors[this.tag],
      this.angle
    );

    strokeRect(
      x,
      y,
      w,
      tileSize,
      '#080808',
      2,
      this.angle
    );

    if (this.selected === true) {
      strokeRect(
        x,
        y,
        w,
        tileSize,
        '#fca044',
        2,
        this.angle
      );
    }
  }
}

export default Piece;
