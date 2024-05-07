import Board from './Board.js';
import Piece from './Piece.js';
import { drawGrid } from './canvas.js';
class BoardEditor extends Board {
  constructor(x, y) {
    super(x, y);
    /** 
     * @callback onDrop
     * @param {boolean} allInBoard
     * @type {onDrop}
    */
    this.onDrop = (_) => { };
    /** @type {Piece[]} */
    this.pieces = [
      new Piece(1, 1, 5, 'A'),

      new Piece(1, 3, 3, 'B'),
      new Piece(1, 5, 3, 'C'),

      new Piece(1, 7, 2, 'D'),
      new Piece(1, 9, 2, 'E'),
      new Piece(1, 11, 2, 'F'),

      new Piece(1, 13, 1, 'G'),
      new Piece(3, 13, 1, 'H'),
      new Piece(1, 15, 1, 'I'),
      new Piece(3, 15, 1, 'J')
    ]
  }
  /** @param {Piece} piece */
  inBoard(piece) {
    return [
      Math.floor(piece.x + 0.5 - this.x),
      Math.floor(piece.y + 0.5 - this.y),
      Math.floor(piece.x + 0.5 - this.x) + (piece.dx * (piece.len - 1)),
      Math.floor(piece.y + 0.5 - this.y) + (piece.dy * (piece.len - 1))
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
      const px = piece.dx * i;
      const py = piece.dy * i;

      const directions = [
        [center.x, center.y],
        [center.x + px + 1, center.y], // right
        [center.x + px - 1, center.y], // left
        [center.x, center.y + py - 1], //up
        [center.x, center.y + py + 1], //down

        [center.x + px - 1, center.y + py - 1],
        [center.x + px + 1, center.y + py - 1],
        [center.x + px - 1, center.y + py + 1],
        [center.x + px + 1, center.y + py + 1]
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

    for (let i = 0; i < piece.len; i++) {
      this.grid[center.y + (i * piece.dy)][center.x + (piece.dx * i)] = piece.tag;
    }

    piece.interpolate(this.x + center.x, this.y + center.y, piece.interpolation.angle, () => { });

    piece.boardX = center.x;
    piece.boardY = center.y;
    piece.inBoard = true;
  }
  /** @param {Piece} piece  */
  remove(piece) {
    for (let i = 0; i < piece.len; i++) {
      this.grid[piece.boardY + (i * piece.dy)][piece.boardX + (i * piece.dx)] = 0;
    }
    piece.inBoard = false;
  }
  /** @param {Piece} piece  */
  rotatePieceInBoard(piece) {
    if (piece.inBoard) {
      this.remove(piece);
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
  shuffle() {
    this.grid = Array.from({ length: 10 }, () => Array(10).fill(0));

    for (const piece of this.pieces) {
      this.remove(piece)
    }

    let lastX = 0;
    let lastY = 0;

    for (let i = 0; i < this.pieces.length; i) {
      const piece = this.pieces[i];
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
        i++;
      }
    }
  }
  draw() {
    drawGrid(this.x, this.y);
    for (let piece of this.pieces) {
      piece.draw();
    }
  }
}

export default BoardEditor;
