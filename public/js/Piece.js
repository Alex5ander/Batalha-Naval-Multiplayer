class Piece {
    constructor(x, y, len, color) {
        this.id = (x + y * 10) + "color";
        this.x = x;
        this.y = y;
        this.count = 0;
        this.startX = x;
        this.startY = y
        this.lx = false;
        this.ly = false;
        this.inBoard = false;
        this.width = len;
        this.height = 1;
        this.len = len;
        this.color = color;
        this.selected = false;
    }
    click(e) {
        var path = new Path2D();
        path.rect(this.x * tileSize, this.y * tileSize, this.width * tileSize, this.height * tileSize);
        if (ctx.isPointInPath(path, e.mx, e.my)) {
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
        this.lx = false;
        this.ly = false;
    }
    mousedown(e) {
        if (this.click(e)) {
            this.selected = true;
        }
    }
    mouseup(e) {
        if (this.click(e)) {
            e.subject.notify({
                type: "drop",
                piece: this
            })
        }
        this.selected = false;
    }
    mousemove(e) {
        if (this.selected) {
            this.x = (e.mx - this.width * tileSize / 2) / tileSize;
            this.y = (e.my - this.height * tileSize / 2) / tileSize;
        }
    }
    touchstart(e) {
        if (this.click(e)) {
            this.selected = true;
        }
    }
    touchend(e) {
        if (this.click(e)) {
            e.subject.notify({
                type: "drop",
                piece: this
            });
        }
        this.selected = false;
    }
    touchmove(e) {
        if (this.selected) {
            this.x = (e.mx - this.width * tileSize / 2) / tileSize;
            this.y = (e.my - this.height * tileSize / 2) / tileSize;
        }
    }
    draw(ctx) {
        fillRect(this.x * tileSize, this.y * tileSize, this.width * tileSize, this.height * tileSize, this.color);
        if (this.selected === true) {
            strokeRect(this.x * tileSize, this.y * tileSize, this.width * tileSize, this.height * tileSize, "black");
        }
    }
}