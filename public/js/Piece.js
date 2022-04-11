class Piece {
    constructor(x, y, len) {
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
        this.selected = false;
    }
    click(x, y) {
        var path = new Path2D();
        path.rect(this.x * tileSize, this.y * tileSize, this.width * tileSize, this.height * tileSize);
        if (ctx.isPointInPath(path, x, y)) {
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
    mousedown({ x, y }) {
        if (this.click(x, y)) {
            this.selected = true;
        }
    }
    mouseup({ x, y }) {
        if (this.click(x, y)) {
            events.push({ type: 'drop', data: { piece: this } });
        }
        this.selected = false;
    }
    mousemove({ x, y }) {
        if (this.selected) {
            this.x = (x - this.width * tileSize / 2) / tileSize;
            this.y = (y - this.height * tileSize / 2) / tileSize;
        }
    }
    touchstart({ x, y }) {
        if (this.click(x, y)) {
            this.selected = true;
        }
    }
    touchend({ x, y }) {
        if (this.click(x, y)) {
            events.push({ type: 'drop', data: { piece: this } });
        }
        this.selected = false;
    }
    touchmove({ x, y }) {
        if (this.selected) {
            this.x = (x - this.width * tileSize / 2) / tileSize;
            this.y = (y - this.height * tileSize / 2) / tileSize;
        }
    }
    draw() {
        fillRect(this.x * tileSize, this.y * tileSize, this.width * tileSize, this.height * tileSize, "blue");
        if (this.selected === true) {
            strokeRect(this.x * tileSize, this.y * tileSize, this.width * tileSize, this.height * tileSize, "black");
        }
    }
}