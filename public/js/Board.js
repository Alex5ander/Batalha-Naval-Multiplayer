class Board {
    constructor(x, y, grid) {
        this.x = x;
        this.y = y;
        this.width = 10;
        this.height = 10;
        this.pieces = {};
        this.selected = false;
        this.grid = [
            [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
        ]
        if (grid && grid.length === 10) {
            this.grid = grid;
        }
    }
    click(x, y) {
        if (x > this.x * tileSize && x < (this.x * tileSize) + this.width * tileSize && y > this.y * tileSize && y < (this.y * tileSize) + this.height * tileSize) {
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
        var normalizedCoords = { x: Math.floor(e.mx / tileSize) - this.x, y: Math.floor(e.my / tileSize) - this.y };
        if (this.click(e.mx, e.my) === true && this.selected === true) {
            firing(normalizedCoords);
        }
        this.selected = false;
    }
    draw() {
        var letters = ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J"];
        for (var i = 0; i < this.grid.length; i++) {
            fillText((i + 1), (this.x * tileSize) - tileSize * .3, (this.y * tileSize) + i * tileSize + tileSize * .1, 16, "black", "right");
            fillText(letters[i], (this.x + i) * tileSize + tileSize / 2, (this.y * tileSize) - 16, 16, "black");
            for (var j = 0; j < this.grid[i].length; j++) {
                var g = this.grid[i][j];
                strokeRect((this.x + j) * tileSize, (this.y + i) * tileSize, tileSize, tileSize, "black");

                if (g === 2) {
                    fillText("X", (this.x + .5 + j) * tileSize, (this.y + .1 + i) * tileSize, tileSize, "red");
                }
            }
        }

        for (var i in this.pieces) {
            if (this.pieces[i]) {
                var p = this.pieces[i];
                fillRect((this.x + p.lx) * tileSize, (this.y + p.ly) * tileSize, p.width * tileSize, p.height * tileSize, p.color);
            }
        }
    }
}