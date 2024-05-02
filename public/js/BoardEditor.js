import Board from './Board.js';
import Piece from './Piece.js';
import { drawGrid } from './canvas.js';
class BoardEditor extends Board {
  constructor(x, y, onDrop = (_) => { }) {
    super(x, y);
    this.onDrop = onDrop;
    /** @type {Piece} */
    this.lastSelectedPiece = null;
  }
  /** @param {Piece} piece */
  inBoard(piece) {
    return [
      Math.floor(piece.x + 0.5 - this.x),
      Math.floor(piece.y + 0.5 - this.y),
      Math.floor(piece.x + 0.5 - this.x) + Math.floor(piece.width) - 1,
      Math.floor(piece.y + 0.5 - this.y) + Math.floor(piece.height) - 1
    ].every(e => e >= 0 && e <= 9)
  }
  /**
   * @param {number} x 
   * @param {number} y 
   * @param {string} tag
   */
  isOccupied([x, y], tag) {
    return x >= 0 && x <= 9 && y >= 0 && y <= 9 && this.grid[y][x] != 0 && this.grid[y][x] != tag;
  }
  /** @param {Piece} piece */
  canInsert(piece) {
    if (!this.inBoard(piece)) {
      return false
    }

    let center = {
      x: Math.floor(piece.x + 0.5 - this.x),
      y: Math.floor(piece.y + 0.5 - this.y),
    }

    for (let i = 0; i < piece.len; i++) {
      const px = piece.width > piece.height ? i : 0;
      const py = piece.width > piece.height ? 0 : i;

      const directions = [
        [center.x, center.y],
        [center.x - 1, center.y - 1],
        [center.x + piece.width, center.y - 1],
        [center.x - 1, center.y + piece.height],
        [center.x + piece.width, center.y + piece.height],
        [center.x + px, center.y + py - 1],
        [center.x + px - 1, center.y + py],
        [center.x + px + 1, center.y + py],
        [center.x + px, center.y + py + 1],
      ];

      if (directions.some((e) => this.isOccupied(e, piece.tag))) {
        return false;
      }
    }

    return true;
  }
  /** @param {Piece} piece */
  insert(piece) {
    const center = {
      x: Math.floor(piece.x + 0.5 - this.x),
      y: Math.floor(piece.y + 0.5 - this.y),
    }

    for (let y = 0; y < piece.height; y++) {
      for (let x = 0; x < piece.width; x++) {
        this.grid[center.y + y][center.x + x] = piece.tag;
      }
    }

    piece.interpolate(this.x + center.x, this.y + center.y);

    piece.boardX = center.x;
    piece.boardY = center.y;

    piece.inBoard = true;
    piece.pulse = true;
    if (this.lastSelectedPiece) {
      this.lastSelectedPiece.pulse = false;
    }
    this.lastSelectedPiece = piece;
  }
  /** @param {Piece} piece  */
  remove(piece) {
    for (let y = 0; y < piece.height; y++) {
      for (let x = 0; x < piece.width; x++) {
        this.grid[piece.boardY + y][piece.boardX + x] = 0;
      }
    }
    this.lastSelectedPiece = null;
    piece.inBoard = false;
    piece.pulse = false;
  }
  rotatePieceInBoard() {
    if (this.lastSelectedPiece) {
      let piece = this.lastSelectedPiece;
      this.remove(this.lastSelectedPiece);
      piece.rotate();
      this.drop(piece);
    }
  }
  /** @param {Piece} piece  */
  drop(piece) {
    if (this.canInsert(piece)) {
      if (piece.inBoard) {
        this.remove(piece);
      }
      this.insert(piece);
    } else {
      if (piece.inBoard) {
        this.remove(piece);
      }
      piece.resete();
    }
    this.onDrop(this.grid.flat().filter(e => e != 0).length == 21);
  }
  /** @param {Piece[]} pieces */
  random(pieces) {
    this.grid = Array.from({ length: 10 }, () => Array(10).fill(0));

    for (const piece of pieces) {
      this.remove(piece)
    }

    let lastX = 0;
    let lastY = 0;

    for (let i = 0; i < pieces.length; i) {
      const piece = pieces[i];
      lastX = piece.x;
      lastY = piece.y;
      if (!piece.inBoard) {
        piece.x = this.x + Math.floor(Math.random() * 10);
        piece.y = this.y + Math.floor(Math.random() * 10);
        if (Math.floor(Math.random() * 2) === 1) {
          piece.rotate();
        }
        this.drop(piece);
        piece.x = lastX;
        piece.y = lastY;
      } else {
        this.lastSelectedPiece.pulse = false;
        this.lastSelectedPiece = null;
        i++;
      }
    }
  }
  draw() {
    drawGrid(this.x, this.y);
  }
}

export default BoardEditor;
