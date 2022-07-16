var canvas = document.getElementById("canvas");
/** @type CanvasRenderingContext2D **/
var ctx = canvas.getContext("2d");

function fillRect(x, y, w, h, color) {
    ctx.fillStyle = color;
    ctx.fillRect(x, y, w, h);
}

function drawTileSprite(img, x, y, size) {
    ctx.drawImage(img, x, y, size, size);
}

function strokeRect(x, y, w, h, color, strokeWidth) {
    ctx.save();
    ctx.lineWidth = strokeWidth || 0.5;
    ctx.strokeStyle = color;
    ctx.strokeRect(x, y, w, h);
    ctx.restore();
}

function fillText(text, x, y, fontSize, color) {
    ctx.save();
    ctx.textBaseline = "middle";
    ctx.textAlign = "center";
    ctx.font = fontSize + "px 'Press Start 2P'";
    ctx.fillStyle = color;
    ctx.fillText(text, x, y);
    ctx.restore();
}