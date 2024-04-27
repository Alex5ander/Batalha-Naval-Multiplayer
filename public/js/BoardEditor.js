import Board from './Board.js';
import Piece from './Piece.js';

class BoardEditor extends Board {
  constructor(x, y, onDrop = (_) => { }) {
    super(x, y);
    this.onDrop = onDrop;
    this.lastSelectedPiece = false;
    this.count = 0;
  }
  isOccupied(x, y) {
    return x >= 0 && x <= 9 && y >= 0 && y <= 9 && this.grid[y][x] !== 0;
  }
  isBusy(piece, nc) {
    for (let i = 0; i < piece.len; i++) {
      const px = piece.width > piece.height ? i : 0;
      const py = piece.width > piece.height ? 0 : i;

      const directions = [
        [nc.x - 1, nc.y - 1],
        [nc.x + piece.width, nc.y - 1],
        [nc.x - 1, nc.y + piece.height],
        [nc.x + piece.width, nc.y + piece.height],
        [nc.x + px, nc.y + py - 1],
        [nc.x + px - 1, nc.y + py],
        [nc.x + px + 1, nc.y + py],
        [nc.x + px, nc.y + py + 1],
      ];

      if (directions.some((e) => this.isOccupied(...e))) {
        return true;
      }
    }

    return false;
  }
  insert(piece, nc) {
    if (this.isBusy(piece, nc) === false) {
      for (var y = 0; y < piece.height; y++) {
        for (var x = 0; x < piece.width; x++) {
          this.grid[nc.y + y][nc.x + x] = piece.tag;
        }
      }

      piece.x = this.x + nc.x;
      piece.y = this.y + nc.y;

      piece.inBoardX = nc.x;
      piece.inBoardY = nc.y;

      piece.inBoard = true;
      this.lastSelectedPiece = piece;

      this.count += 1;
      return true;
    }
    return false;
  }
  move(piece, nc) {
    this.remove(piece);
    if (this.insert(piece, nc)) {
      return true;
    }
    return false;
  }
  remove(piece) {
    if (piece.inBoard) {
      for (var y = 0; y < piece.height; y++) {
        for (var x = 0; x < piece.width; x++) {
          this.grid[piece.inBoardY + y][piece.inBoardX + x] = 0;
        }
      }
      this.lastSelectedPiece = false;
      this.count -= 1;
    }
    piece.inBoard = false;
  }
  rotatePieceInBoard() {
    if (this.lastSelectedPiece) {
      var piece = this.lastSelectedPiece;
      var w = piece.width;
      var h = piece.height;
      this.remove(piece);
      piece.width = h;
      piece.height = w;
      piece.x = this.x + piece.inBoardX;
      piece.y = this.y + piece.inBoardY;
      this.drop(piece);
    }
  }
  drop(piece) {
    var nc = {
      x: Math.floor(piece.x + 0.5 - this.x),
      y: Math.floor(piece.y + 0.5 - this.y),
    };
    var ex = nc.x + Math.floor(piece.width) - 1;
    var ey = nc.y + Math.floor(piece.height) - 1;
    if (
      nc.x >= 0 &&
      nc.x <= 9 &&
      nc.y >= 0 &&
      nc.y <= 9 &&
      ex >= 0 &&
      ex <= 9 &&
      ey >= 0 &&
      ey <= 9
    ) {
      if (piece.inBoard) {
        if (this.move(piece, nc) === false) {
          piece.x = this.x + piece.inBoardX;
          piece.y = this.y + piece.inBoardY;
          var nc = {
            x: Math.floor(piece.x + 0.5 - this.x),
            y: Math.floor(piece.y + 0.5 - this.y),
          };
          this.insert(piece, nc);
        }
      } else if (!piece.inBoard) {
        if (this.insert(piece, nc) === false) {
          piece.resete();
        }
      }
    } else {
      this.remove(piece);
      piece.resete();
    }

    this.onDrop(this.count === 10);
  }

  /**
   *
   * @param {Piece[]} pieces
   */
  random(pieces) {
    this.grid = Array.from({ length: 10 }, () => Array(10).fill(0));
    this.count = 0;

    for (const piece of pieces) {
      piece.inBoard = false;
    }

    for (let i = 0; i < pieces.length; i) {
      const piece = pieces[i];
      if (!piece.inBoard) {
        piece.x = this.x + Math.floor(Math.random() * 10);
        piece.y = this.y + Math.floor(Math.random() * 10);
        if (Math.floor(Math.random() * 2) === 1) {
          this.lastSelectedPiece = piece;
          this.rotatePieceInBoard();
        }
        this.drop(piece);
      } else {
        i++;
      }
    }
  }
}

export default BoardEditor;
