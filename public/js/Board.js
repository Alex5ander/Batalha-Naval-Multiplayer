var waterTile = new Image();
waterTile.src = "../images/watertile.png";

class Board {
    constructor(x, y, grid) {
        this.x = x;
        this.y = y;
        this.width = 10;
        this.height = 10;
        this.pieces = {};
        if (grid && grid.length === 10) {
            this.grid = grid;
        } else {
            this.grid = [];
            for (var i = 0; i < 10; i++) {
                this.grid.push([0, 0, 0, 0, 0, 0, 0, 0, 0, 0]);
            }
        }
        this.selected = false;
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
        var nc = { x: Math.floor(e.mx / tileSize) - this.x, y: Math.floor(e.my / tileSize) - this.y };
        if (this.click(e.mx, e.my) === true && this.selected === true) {
            e.subject.notify({
                type: "firing",
                nc: nc
            });
        }
        this.selected = false;
    }
    draw(ctx) {
        var letters = ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J"];
        for(let i = 0; i <32; i++) {
            for(let j = 0; j <  24; j++) {
                strokeRect(i * tileSize, j * tileSize, tileSize, tileSize, "#080808");
            }
        }

        for (var i = 0; i < this.grid.length; i++) {
            for (var j = 0; j < this.grid[i].length; j++) {
                var g = this.grid[i][j];
                drawTileSprite(waterTile, (this.x + j) * tileSize, (this.y + i) * tileSize, tileSize);
            }
        }

        for (var i in this.pieces) {
            if (this.pieces[i]) {
                var p = this.pieces[i];
                fillRect((this.x + p.lx) * tileSize, (this.y + p.ly) * tileSize, p.width * tileSize, p.height * tileSize, p.color);
            }
        }

        for (var i = 0; i < this.grid.length; i++) {
            let nx =  (this.x * tileSize) - (tileSize / 2);
            let ny = (this.y * tileSize) + i * tileSize + tileSize / 4;
            let fontSize = tileSize / 2;


            let lx = (this.x + i) * tileSize + tileSize / 2;
            let ly = (this.y * tileSize) - tileSize / 1.5;

            fillText((i + 1), nx, ny, fontSize, "#080808");
            fillText(letters[i], lx, ly, fontSize, "#080808");

            for (var j = 0; j < this.grid[i].length; j++) {
                var g = this.grid[i][j];
               
                if (g === 3) {
                    fillRect((this.x + j) * tileSize, (this.y + i) * tileSize, tileSize, tileSize, "#0000bc");
                }

                if (g === 2) {
                    fillText("X", (this.x + .5 + j) * tileSize, (this.y + .1 + i) * tileSize, tileSize, "#f83800");
                }

                strokeRect((this.x + j) * tileSize, (this.y + i) * tileSize, tileSize, tileSize, "#3cbcfcff");
            }
        }
    }
}
