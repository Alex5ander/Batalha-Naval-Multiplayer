class BoardEditor extends Board {
    constructor(x, y, grid) {
        super(x, y, grid);
    }
    drop({ piece }) {
        let nx = Math.floor(piece.x) - this.x;
        let ny = Math.floor(piece.y) + this.y;
      
       console.log(ny)
    }
}