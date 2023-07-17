import Board from './Board.js';

class BoardEditor extends Board {
  constructor(x, y, onDrop = (_) => {}) {
    super(x, y);
    this.onDrop = onDrop;
    this.lastSelectedPiece = false;
    this.count = 0;
  }
  isBusy(piece, nc) {
    var busy = false;
    const isOccupied = (x, y) =>
      x >= 0 && x <= 9 && y >= 0 && y <= 9 && this.grid[y][x] === 1;
    var d =
      isOccupied(nc.x - 1, nc.y - 1) ||
      isOccupied(nc.x + piece.width, nc.y - 1) ||
      isOccupied(nc.x + piece.width, nc.y + piece.height) ||
      isOccupied(nc.x - 1, nc.y + piece.height);

    for (var i = 0; i < piece.len; i++) {
      if (piece.width > piece.height) {
        var hy =
          isOccupied(nc.x + i, nc.y - 1) || isOccupied(nc.x + i, nc.y + 1);
        var vx =
          isOccupied(nc.x - 1, nc.y) || isOccupied(nc.x + piece.width, nc.y);
        if (isOccupied(nc.x + i, nc.y) || vx || hy || d) {
          busy = true;
          break;
        }
      } else {
        var hy =
          isOccupied(nc.x, nc.y - 1) || isOccupied(nc.x, nc.y + piece.height);
        var vx =
          isOccupied(nc.x - 1, nc.y + i) || isOccupied(nc.x + 1, nc.y + i);
        if (isOccupied(nc.x, nc.y + i) || vx || hy || d) {
          busy = true;
          break;
        }
      }
    }
    return busy;
  }
  insert(piece, nc) {
    if (this.isBusy(piece, nc) === false) {
      for (var y = 0; y < piece.height; y++) {
        for (var x = 0; x < piece.width; x++) {
          var ind = nc.x + x + (nc.y + y) * 10;
          this.grid[nc.y + y][nc.x + x] = 1;
          this.pieces[ind] = piece;
        }
      }
      piece.x = this.x + nc.x;
      piece.y = this.y + nc.y;

      this.pieces[piece.id] = piece;

      piece.lx = nc.x;
      piece.ly = nc.y;

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
          var ind = piece.lx + x + (piece.ly + y) * 10;
          this.grid[piece.ly + y][piece.lx + x] = 0;
          delete this.pieces[ind];
        }
      }
      this.lastSelectedPiece = false;
      delete this.pieces[piece.id];
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
      piece.x = this.x + piece.lx;
      piece.y = this.y + piece.ly;
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
          piece.x = this.x + piece.lx;
          piece.y = this.y + piece.ly;
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

    this.onDrop(this.count == 10);
  }
}

export default BoardEditor;
