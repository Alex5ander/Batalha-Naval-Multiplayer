var canvas = document.getElementById("canvas");
/** @type CanvasRenderingContext2D **/
var ctx = canvas.getContext("2d");
var tileSize = 32;
var btnBatalhar = document.getElementById("btn-batalhar");
var awaitcontainer = document.getElementById("awaitcontainer");
var playGameScreen = document.getElementById("play-game-screen");
var btnJogar = document.getElementById("btn-jogar");
var btnCancelar = document.getElementById("btn-cancelar");
var inputPlayerName = document.getElementById("input-player-name");
var form = document.getElementById("form");
var btnRotatePiece = document.getElementById("btn-rotate-piece");
var gameArea = document.getElementById("game-area");

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
            btnRotatePiece.classList.remove("hidden");
            btnBatalhar.onclick = function (e) {
                game.network(Editor);
                e.preventDefault();
            }
            btnCancelar.onclick = function (e) {
                if (game.socket) {
                    game.socket.close();
                    game.socket = false;
                }
                awaitcontainer.classList.add("hidden");
                form.classList.add("hidden");
                btnRotatePiece.classList.remove("hidden");
            }
            this.objects.push(Editor);
            this.objects.push(new Piece(1, 1, 5, "#f83800"));

            this.objects.push(new Piece(1, 3, 3, "#00b800"));
            this.objects.push(new Piece(1, 5, 3, "#00b800"));

            this.objects.push(new Piece(1, 7, 2, "#d8f878"));
            this.objects.push(new Piece(1, 9, 2, "#d8f878"));
            this.objects.push(new Piece(1, 11, 2, "#d8f878"));

            this.objects.push(new Piece(1, 13, 1, "#d800cc"));
            this.objects.push(new Piece(1, 15, 1, "#d800cc"));
            this.objects.push(new Piece(1, 17, 1, "#d800cc"));
            this.objects.push(new Piece(1, 19, 1, "#d800cc"));
            playGameScreen.classList.add('hidden');
            this.renderLoop();
        }
    },
    resete: function () {
        this.objects = [];
        playGameScreen.classList.remove('hidden');
        form.classList.add("hidden");
        awaitcontainer.classList.add("hidden");
        btnRotatePiece.classList.add("hidden");
        this.data = false;
        this.myboard = false;
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
            form.classList.add("hidden");
            btnRotatePiece.classList.add("hidden");

            if (data.awaitPlayer2) {
                awaitcontainer.classList.remove("hidden");
            }else {
                awaitcontainer.classList.add("hidden");
            }

            game.socket.emit("load-grid", {
                name: inputPlayerName.value.trim() || 'Player ' + Math.floor(Math.random() * 100),
                grid: Editor.grid,
                pieces: Editor.pieces
            });
        });
        this.socket.on("update-game", data => {
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
            if(data.othername) {
                awaitcontainer.classList.add("hidden");
            }
        });
    },
    notify: function (e) {
        if (e.type == "allInBoard") {
            if (e.allInBoard === true) {
                form.classList.remove("hidden");
            } else if (e.allInBoard === false) {
                form.classList.add("hidden");
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
        fillRect(0, 0, canvas.width, canvas.height, "#f8f8f8");
        for (var i = 0; i < this.events.length; i++) {
            var e = this.events[i];
            for (var j = 0; j < this.objects.length; j++) {
                if (this.objects[j][e.type]) {
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
      
            fillText(this.data.myname, 6 * tileSize, 2 * tileSize, 12, "#00b800", "center");
            fillText(this.data.othername, 24 * tileSize, 2 * tileSize, 12, "#f83800", "center");

            if(this.data.winner) {
                if (this.data.winner === this.data.myname) {
                    fillRect(0, 0, canvas.width, canvas.height, "#00b8007f");
                    fillText("Você venceu!", 16 * tileSize, 12 * tileSize, 32, "#f8f8f8");
                } else {
                    fillRect(0, 0, canvas.width, canvas.height, "#f838007f");
                    fillText("Você perdeu!", 16 * tileSize, 12 * tileSize, 32, "#f8f8f8");
                }
            } else {
                var color = turno === this.data.myname ? "#00b800" : "#f83800";
                fillText("Turno: " + turno, 15 * tileSize, 1 * tileSize, 12, color);
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