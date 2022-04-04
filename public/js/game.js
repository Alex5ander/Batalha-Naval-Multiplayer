var awaitcontainer = document.getElementById("awaitcontainer");

var inputPlayerName = document.getElementById("inputPlayerName");
var formControls = document.getElementById("formcontrols");

var btnPlay = document.getElementById("btnPlay");
var btnCancel = document.getElementById("btnCancel");
var btnRotatePiece = document.getElementById("btnRotatePiece");
var btnBattle = document.getElementById("btnBattle");

var gameArea = document.getElementById("gameArea");

var tileSize = 32;
var cols = 32;
var rows = 32;
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

btnPlay.onclick = function () {
    btnPlay.hidden = true;
    game.init();
}

function mouseevents(e) {
    var rect = canvas.getBoundingClientRect();
    var coords = {
        subject: game,
        mx: Math.floor(((e.clientX - rect.x) / rect.width) * canvas.width),
        my: Math.floor(((e.clientY - rect.y) / rect.height) * canvas.height)
    };
    var data = Object.assign(e, coords);
    events.push(data);
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
    events.push(data);
}


let objects = [];
let events = [];
let socket = false;
let data = false;
let myboard = false;

const init = () => {
    if (objects.length === 0) {
        var Editor = new BoardEditor(10, 6);
        btnRotatePiece.hidden = false;
        btnBattle.onclick = function (e) {
            network(Editor);
            e.preventDefault();
        }
        btnCancel.onclick = function (e) {
            disconnect();
            awaitcontainer.hidden = true;
            formControls.hidden = false;
            btnRotatePiece.hidden = false;
        }
        objects.push(Editor);
        objects.push(new Piece(1, 1, 5, "#ff5722"));

        objects.push(new Piece(1, 3, 3, "#8bc34a"));
        objects.push(new Piece(1, 5, 3, "#8bc34a"));

        objects.push(new Piece(1, 7, 2, "#ffeb3b"));
        objects.push(new Piece(1, 9, 2, "#ffeb3b"));
        objects.push(new Piece(1, 11, 2, "#ffeb3b"));

        objects.push(new Piece(1, 13, 1, "#9c27b0"));
        objects.push(new Piece(1, 15, 1, "#9c27b0"));
        objects.push(new Piece(1, 17, 1, "#9c27b0"));
        objects.push(new Piece(1, 19, 1, "#9c27b0"));
        renderLoop();
    }
};

const  resete = () => {
    objects = [];
    btnPlay.hidden = false;
    formControls.hidden = true;
    awaitcontainer.hidden = true;
    data = false;
    myboard = false;
    btnRotatePiece.hidden = true;
};

const network = (Editor) => {
    connect();
    connect_error(game.resete);

    init_config(data => {
        myboard = new Board(2, 6);
        myboard.pieces = Editor.pieces;

        if (data.awaitPlayer2) {
            formControls.hidden = true;
            btnRotatePiece.hidden = true;
            awaitcontainer.hidden = false;
        }
        if (btnRotatePiece.hidden === false) {
            btnRotatePiece.hidden = true;
        }
    }, 
    {
        name: inputPlayerName.value.trim() || 'Player ' + Math.floor(Math.random() * 100),
        grid: Editor.grid,
        pieces: Editor.pieces
    });


    update_game(data => {
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
        data = data;
        myboard.grid = data.mygrid;
        var myhits = new Board(16, 6, data.myhits);
        myhits.pieces = data.pieces;
        game.objects = [myhits];
    });
};

const notify = e => {
    if (e.type == "allInBoard") {
        if (e.allInBoard === true && formControls.hidden === true) {
            formControls.hidden = false;
        } else if (e.allInBoard === false && formControls.hidden === false) {
            formControls.hidden = true;
        }
    } else if (e.type === "firing") {
        firing(e);
    } else {
        var s = { subject: game };
        events.push(Object.assign(s, e));
    }
};

const  firing = e => {
    if (socket && data.myturno === true) {
        socket.emit("firing", e.nc);
    }
};


const renderLoop = () => {
    for (var i = 0; i < events.length; i++) {
        var e = events[i];
        for (var j = 0; j < objects.length; j++) {
            if (objects[j][e.type] && awaitcontainer.hidden === true && btnPlay.hidden === true) {
                objects[j][e.type](e);
            }
        }
        events.splice(i, 1);
        i--;
    }

    fillRect(0, 0, canvas.width, canvas.height, "lightgray");
    for (var i = 0; i < objects.length; i++) {
        objects[i].draw(ctx);
    }
    if (data) {
        myboard.draw(ctx);
        var turno = data.myturno === true ? data.myname : data.othername;
        var fontSize = tileSize - (tileSize / 4);
        fillText(data.myname, 6 * tileSize, 2 * tileSize, fontSize * 1.2, "green", "center");
        fillText(data.othername, 24 * tileSize, 2 * tileSize, fontSize * 1.2, "red", "center");

        if (data.winner) {
            fillRect(0, 11 * tileSize, 32 * tileSize, 3 * tileSize, "white");
            fillText("Jogador: " + data.winner + " Venceu!", 16 * tileSize, 12 * tileSize, fontSize * 2, "orange");
        } else {
            var color = turno === data.myname ? "green" : "red";
            fillText("Turno: " + turno, 15 * tileSize, 1 * tileSize, fontSize * 1.5, color);
        }
    }
    window.requestAnimationFrame(renderLoop);
}

canvas.addEventListener("mousedown", mouseevents);
canvas.addEventListener("mousemove", mouseevents);
canvas.addEventListener("mouseup", mouseevents);

canvas.addEventListener("touchstart", touchevents);
canvas.addEventListener("touchmove", touchevents);
canvas.addEventListener("touchend", touchevents);

btnRotatePiece.onclick = function (e) {
    events.push({
        type: "rotatePieceInBoard",
        subject: game
    })
}