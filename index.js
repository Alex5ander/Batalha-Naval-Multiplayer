var http = require("http");
var helmet = require("helmet");
var express = require("express");
var app = express();
app.disable("x-powered-by");
app.use(helmet());
app.use(express.static("public"));
var server = http.createServer(app);
server.listen(3000, function () {

});
var sockets = require("socket.io")(server);

var roomsNo = 0;
var game = {};
var maxScore = 21;

sockets.on("connection", socket => {
	roomsNo += 1;
	var roomid = Math.round(roomsNo / 2);
	socket.join(roomid);
	socket.on("disconnect", () => {
		delete game[roomid];
		roomsNo -= 1;
		sockets.to(roomid).emit("another_player_disconnected", {
			another_playerid: socket.id
		});
	});

	function updateGame(roomid) {
		var room = game[roomid];
		var p1 = game[roomid].p1;
		var p2 = game[roomid].p2;

		sockets.to(p1.id).emit("update-game", {
			myname: p1.name,
			othername: p2.name,
			mygrid: p1.grid,
			myhits: p1.myhits,
			winner: room.winner,
			pieces: p1.drawpieces,
			myturno: room.turno === 1
		});
		sockets.to(p2.id).emit("update-game", {
			myname: p2.name,
			othername: p1.name,
			mygrid: p2.grid,
			myhits: p2.myhits,
			winner: room.winner,
			pieces: p2.drawpieces,
			myturno: room.turno === 2
		});
	}
	function createRoom(roomid) {
		game[roomid] = {
			winner: false,
			turno: 1 + Math.floor(Math.random() * 2),
			p1: {
				id: socket.id,
				score: 0,
				grid: []
			},
			p2: {
				id: null,
				score: 0,
				grid: []
			},
			[socket.id]: {
				no: 1
			}
		};
		sockets.to(socket.id).emit("init-config", {
			awaitPlayer2: true
		});
	}
	if (roomsNo % 2 === 1) {
		createRoom(roomid);
	} else if (roomsNo % 2 === 0) {
		if (game[roomid] !== undefined) {
			game[roomid].p2.id = socket.id;
			game[roomid][socket.id] = { no: 2 };
			sockets.to(socket.id).emit("init-config", {
				awaitPlayer2: false
			});
		} else {
			createRoom(roomid);
		}
	}
	socket.on("load-grid", data => {
		var n = game[roomid][socket.id].no;
		game[roomid]["p" + n].name = data.name;
		var count = 0;
		if (Array.isArray(data.grid) && data.grid.length === 10) {

			for (var i = 0; i < data.grid.length; i++) {
				for (var j = 0; j < data.grid[i].length; j++) {
					if (data.grid[i].length === 10) {
						var g = data.grid[i][j];
						if (g === 1) {
							count += 1;
						}
					} else {
						count = 0;
						break;
					}
				}
			}
			if (count !== maxScore) {
				socket.disconnect(0);
			}
		}
		game[roomid]["p" + n].grid = data.grid;
		game[roomid]["p" + n].pieces = data.pieces;
		game[roomid]["p" + n].drawpieces = {};
		game[roomid]["p" + n].myhits =
			[
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
			];
		if (game[roomid]["p1"].grid.length !== 0 && game[roomid]["p2"].grid.length !== 0) {
			updateGame(roomid);
		}
	});
	socket.on("firing", coords => {
		var room = game[roomid];
		var n = room[socket.id].no;
		if (coords.x >= 0 && coords.x <= 9 && coords.y >= 0 && coords.y <= 9 && room.winner === false) {
			if (n === 1 && game[roomid].turno === 1) {
				var targetGrid = room.p2.grid;
				if (targetGrid[coords.y][coords.x] === 1) {
					room.p2.grid[coords.y][coords.x] = 2;
					room.p1.myhits[coords.y][coords.x] = 2;

					if (room.p2.pieces[coords.x + coords.y * 10].id) {
						var id = room.p2.pieces[coords.x + coords.y * 10].id;
						var piece = room.p2.pieces[id];
						piece.count += 1;

						if (piece.count === piece.len) {
							for (var y = 0; y < piece.height; y++) {
								for (var x = 0; x < piece.width; x++) {
									room.p1.drawpieces[(piece.x + x) + (piece.y + y) * 10] = piece;
								}
							}
						}

					}

					room.p1.score += 1;
					if (room.p1.score === maxScore) {
						room.winner = room.p1.name;
					}
				} else if (targetGrid[coords.y][coords.x] === 0) {
					room.p2.grid[coords.y][coords.x] = 3;
					room.p1.myhits[coords.y][coords.x] = 3;
					room.turno = 2;
				}
			} else if (n === 2 && room.turno === 2) {
				var targetGrid = room.p1.grid;
				if (targetGrid[coords.y][coords.x] === 1) {
					room.p1.grid[coords.y][coords.x] = 2;
					room.p2.myhits[coords.y][coords.x] = 2;

					if (room.p1.pieces[coords.x + coords.y * 10].id) {
						var id = room.p1.pieces[coords.x + coords.y * 10].id;
						var piece = room.p1.pieces[id];
						piece.count += 1;

						if (piece.count === piece.len) {
							for (var y = 0; y < piece.height; y++) {
								for (var x = 0; x < piece.width; x++) {
									room.p2.drawpieces[(piece.x + x) + (piece.y + y) * 10] = piece;
								}
							}
						}

					}

					room.p2.score += 1;
					if (room.p2.score === maxScore) {
						room.winner = room.p2.name;
					}
				} else if (targetGrid[coords.y][coords.x] === 0) {
					room.p1.grid[coords.y][coords.x] = 3;
					room.p2.myhits[coords.y][coords.x] = 3;
					room.turno = 1;
				}
			}

			updateGame(roomid);
		}
	});
});