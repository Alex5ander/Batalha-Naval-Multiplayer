var canvas = document.getElementById("canvas");
/** @type CanvasRenderingContext2D **/
var ctx = canvas.getContext("2d");
var tileSize = 20;
var btnBatalhar = document.getElementById("btnBatalhar");
var awaitcontainer = document.getElementById("awaitcontainer");
var btnJogar = document.getElementById("btnJogar");
var btnCancelar = document.getElementById("btnCancelar");
var inputPlayerName = document.getElementById("inputPlayerName");
var formControls = document.getElementById("formcontrols");
var btnRotatePiece = document.getElementById("btnRotatePiece");
var gameArea = document.getElementById("gameArea");

var cols = 32;
var rows = 24;
var gameAP = cols / rows;

window.addEventListener("resize", resize);
window.addEventListener("orientationchange", resize);
resize();

function resize(e) {
    var newWidth = window.innerWidth;
    var newHeight = window.innerHeight;
    gameArea.style.width = newWidth + "px";
    gameArea.style.height = newHeight + "px";
    var asp = window.innerWidth / window.innerHeight;
    if (asp > gameAP) {
        newWidth = (window.innerHeight * gameAP);
    } else {
        newHeight = (window.innerWidth / gameAP);
    }

    canvas.width = newWidth;
    canvas.height = newHeight;

    tileSize = 2 + (newWidth / cols);
    ctx.imageSmoothingEnabled = false;
}

btnJogar.onclick = function () {
    game.init(ctx);
}

function fillRect(x, y, w, h, color) {
    ctx.fillStyle = color;
    ctx.fillRect(x, y, w, h);
}

function strokeRect(x, y, w, h, color) {
    ctx.save();
    ctx.lineWidth = 0.5;
    ctx.strokeStyle = color;
    ctx.strokeRect(x, y, w, h);
    ctx.restore();
}

function fillText(text, x, y, fontSize, color, align) {
    ctx.save();
    ctx.textBaseline = "top";
    ctx.textAlign = align || "center";
    ctx.font = fontSize + "px Verdana";
    ctx.fillStyle = color;
    ctx.fillText(text, x, y);
    ctx.restore();
}

function mouseevents(e) {
    var rect = canvas.getBoundingClientRect();
    var coords = {
        subject: game,
        mx: Math.floor(((e.clientX - rect.x) / rect.width) * canvas.width),
        my: Math.floor(((e.clientY - rect.y) / rect.height) * canvas.height)
    };
    var data = Object.assign(e, coords);
    game.events.push(data);
}

function touchevents(e) {
    var rect = canvas.getBoundingClientRect();
    var coords = { subject: game };
    if (e.type === "touchend") {
        coords.mx = Math.floor(((e.changedTouches[0].clientX - rect.x) / rect.width) * canvas.width);
        coords.my = Math.floor(((e.changedTouches[0].clientY - rect.y) / rect.height) * canvas.height);
    } else {
        coords.mx = Math.floor(((e.targetTouches[0].clientX - rect.x) / rect.width) * canvas.width);
        coords.my = Math.floor(((e.targetTouches[0].clientY - rect.y) / rect.height) * canvas.height);
    }
    var data = Object.assign(e, coords);
    game.events.push(data);
}

var game = {
    objects: [],
    events: [],
    ctx: false,
    socket: false,
    data: false,
    myboard: false,
    init: function (ctx) {
        this.ctx = ctx;
        if (this.objects.length === 0) {
            var Editor = new BoardEditor(10, 6);
            btnRotatePiece.hidden = false;
            btnBatalhar.onclick = function (e) {
                game.network(Editor);
                e.preventDefault();
            }
            btnCancelar.onclick = function (e) {
                if (game.socket) {
                    game.socket.close();
                    game.socket = false;
                }
                awaitcontainer.hidden = true;
                formControls.hidden = false;
                btnRotatePiece.hidden = false;
            }
            this.objects.push(Editor);
            this.objects.push(new Piece(1, 1, 5, "#ff5722"));

            this.objects.push(new Piece(1, 3, 3, "#8bc34a"));
            this.objects.push(new Piece(1, 5, 3, "#8bc34a"));

            this.objects.push(new Piece(1, 7, 2, "#ffeb3b"));
            this.objects.push(new Piece(1, 9, 2, "#ffeb3b"));
            this.objects.push(new Piece(1, 11, 2, "#ffeb3b"));

            this.objects.push(new Piece(1, 13, 1, "#9c27b0"));
            this.objects.push(new Piece(1, 15, 1, "#9c27b0"));
            this.objects.push(new Piece(1, 17, 1, "#9c27b0"));
            this.objects.push(new Piece(1, 19, 1, "#9c27b0"));
            btnJogar.hidden = true;
            this.renderLoop();
        }
    },
    resete: function () {
        this.objects = [];
        btnJogar.hidden = false;
        formControls.hidden = true;
        awaitcontainer.hidden = true;
        this.data = false;
        this.myboard = false;
        btnRotatePiece.hidden = true;
        if (game.socket) {
            game.socket.close();
            game.socket = false;
        }
    },
    network: function (Editor) {
        if (this.socket === false) {
            this.socket = io();
        }
        this.socket.on("connect_error", error => {
            game.resete();
        });
        this.socket.on("another_player_disconnected", (data) => {
            game.resete();
        });
        this.socket.on("init-config", (data) => {
            this.myboard = new Board(2, 6);
            this.myboard.pieces = Editor.pieces;
            if (data.awaitPlayer2) {
                formControls.hidden = true;
                btnRotatePiece.hidden = true;
                awaitcontainer.hidden = false;
            }
            if (btnRotatePiece.hidden === false) {
                btnRotatePiece.hidden = true;
            }
            game.socket.emit("load-grid", {
                name: inputPlayerName.value.trim() || 'Player ' + Math.floor(Math.random() * 100),
                grid: Editor.grid,
                pieces: Editor.pieces
            });
        });
        this.socket.on("update-game", data => {
            if (formControls.hidden === false) {
                formControls.hidden = true;
            }
            if (awaitcontainer.hidden === false) {
                awaitcontainer.hidden = true;
            }
            if (data.winner) {
                setTimeout(function () {
                    game.resete();
                }, 5000);
            }
            this.data = data;
            this.myboard.grid = this.data.mygrid;
            var myhits = new Board(16, 6, data.myhits);
            myhits.pieces = data.pieces;
            game.objects = [myhits];
        });
    },
    notify: function (e) {
        if (e.type == "allInBoard") {
            if (e.allInBoard === true && formControls.hidden === true) {
                formControls.hidden = false;
            } else if (e.allInBoard === false && formControls.hidden === false) {
                formControls.hidden = true;
            }
        } else if (e.type === "firing") {
            this.firing(e);
        } else {
            var s = { subject: game };
            this.events.push(Object.assign(s, e));
        }
    },
    firing: function (e) {
        if (this.socket && this.data.myturno === true) {
            this.socket.emit("firing", e.nc);
        }
    },
    renderLoop: function () {
        fillRect(0, 0, canvas.width, canvas.height, "lightgray");
        for (var i = 0; i < this.events.length; i++) {
            var e = this.events[i];
            for (var j = 0; j < this.objects.length; j++) {
                if (this.objects[j][e.type] && awaitcontainer.hidden === true && btnJogar.hidden === true) {
                    this.objects[j][e.type](e);
                }
            }
            this.events.splice(i, 1);
            i--;
        }
        for (var i = 0; i < this.objects.length; i++) {
            this.objects[i].draw(this.ctx);
        }
        if (this.data) {
            this.myboard.draw(this.ctx);
            var turno = this.data.myturno === true ? this.data.myname : this.data.othername;
            var fontSize = tileSize - (tileSize / 4);
            fillText(this.data.myname, 6 * tileSize, 2 * tileSize, fontSize * 1.2, "green", "center");
            fillText(this.data.othername, 24 * tileSize, 2 * tileSize, fontSize * 1.2, "red", "center");

            if (this.data.winner) {
                fillRect(0, 11 * tileSize, 32 * tileSize, 3 * tileSize, "white");
                fillText("Jogador: " + this.data.winner + " Venceu!", 16 * tileSize, 12 * tileSize, fontSize * 2, "orange");
            } else {
                var color = turno === this.data.myname ? "green" : "red";
                fillText("Turno: " + turno, 15 * tileSize, 1 * tileSize, fontSize * 1.5, color);
            }
        }
        window.requestAnimationFrame(this.renderLoop.bind(this));
    }
};

canvas.addEventListener("mousedown", mouseevents);
canvas.addEventListener("mousemove", mouseevents);
canvas.addEventListener("mouseup", mouseevents);

canvas.addEventListener("touchstart", touchevents);
canvas.addEventListener("touchmove", touchevents);
canvas.addEventListener("touchend", touchevents);

btnRotatePiece.onclick = function (e) {
    game.events.push({
        type: "rotatePieceInBoard",
        subject: game
    })
}