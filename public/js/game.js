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
var gameAspectRatio = cols / rows;

const resize = e => {
    var newWidth = window.innerWidth;
    var newHeight = window.innerHeight;
    gameArea.style.width = newWidth + "px";
    gameArea.style.height = newHeight + "px";
    var asp = window.innerWidth / window.innerHeight;
    if (asp > gameAspectRatio) {
        newWidth = (window.innerHeight * gameAspectRatio);
    } else {
        newHeight = (window.innerWidth / gameAspectRatio);
    }

    canvas.width = newWidth;
    canvas.height = newHeight;

    tileSize = 2 + (newWidth / cols);
    ctx.imageSmoothingEnabled = false;
}

window.addEventListener("resize", resize);
window.addEventListener("orientationchange", resize);
resize();

let objects = [];
let data = false;
let myboard = false;
let editor = null;
let events = [];

const cancel = () => {
    disconnect();
    awaitcontainer.hidden = true;
    formControls.hidden = false;
    btnRotatePiece.hidden = false;
}

const battle = (e) => {
    e.preventDefault();
    network(editor);
}

const init = () => {
    if (objects.length === 0) {
        editor = new BoardEditor(10, 10);
        btnRotatePiece.hidden = false;

        btnBattle.onclick = battle;
        btnCancel.onclick = cancel;

        objects.push(editor);
        objects.push(new Piece(1, 1, 5));

        objects.push(new Piece(1, 3, 3));
        objects.push(new Piece(1, 5, 3));

        objects.push(new Piece(1, 7, 2));
        objects.push(new Piece(1, 9, 2));
        objects.push(new Piece(1, 11, 2));

        objects.push(new Piece(1, 13, 1));
        objects.push(new Piece(1, 15, 1));
        objects.push(new Piece(1, 17, 1));
        objects.push(new Piece(1, 19, 1));
        renderLoop();
    }
};

const renderLoop = () => {
    for(let i = 0; i < events.length; i++) {
        let event = events[i];
        for(let object of objects) {
            if(object[event.type]) {
                object[event.type](event.data);
            }
        }
        events.splice(i, 1);
    }

    fillRect(0, 0, canvas.width, canvas.height, "lightgray");

    for (var i = 0; i < objects.length; i++) {
        objects[i].draw();
    }
    if (data) {
        myboard.draw();
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

const resete = () => {
    objects = [];
    btnPlay.hidden = false;
    formControls.hidden = true;
    awaitcontainer.hidden = true;
    data = false;
    myboard = false;
    btnRotatePiece.hidden = true;
};

const network = (editor) => {
    connect();
    connect_error(resete);

    init_config(data => {
        myboard = new Board(2, 6);
        myboard.pieces = editor.pieces;

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
        grid: editor.grid,
        pieces: editor.pieces
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
                resete();
            }, 5000);
        }
        data = data;
        myboard.grid = data.mygrid;
        var myhits = new Board(16, 6, data.myhits);
        myhits.pieces = data.pieces;
        objects = [myhits];
    });
};

const mouseevents = e => {
    var rect = canvas.getBoundingClientRect();
    let x = Math.floor(((e.clientX - rect.x) / rect.width) * canvas.width);
    let y = Math.floor(((e.clientY - rect.y) / rect.height) * canvas.height);

    events.push({type: e.type, data: { x, y } })
}

const touchevents = e => {
    var rect = canvas.getBoundingClientRect();
    let x = 0;
    let y = 0;
    if (e.type === "touchend") {
        x = Math.floor(((e.changedTouches[0].clientX - rect.x) / rect.width) * canvas.width);
        y = Math.floor(((e.changedTouches[0].clientY - rect.y) / rect.height) * canvas.height);
    } else {
        x = Math.floor(((e.targetTouches[0].clientX - rect.x) / rect.width) * canvas.width);
        y = Math.floor(((e.targetTouches[0].clientY - rect.y) / rect.height) * canvas.height);
    }

    events.push({type: e.type, data: { x, y } })
}

canvas.addEventListener("mousedown", mouseevents);
canvas.addEventListener("mousemove", mouseevents);
canvas.addEventListener("mouseup", mouseevents);

canvas.addEventListener("touchstart", touchevents);
canvas.addEventListener("touchmove", touchevents);
canvas.addEventListener("touchend", touchevents);

btnRotatePiece.onclick = () => {
    
}

btnPlay.onclick = () => {
    btnPlay.hidden = true;
    init();
}
