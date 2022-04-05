let socket = false;

const connect = () => {
    socket = io();
    connect_error
}

const init_config = (action, config) => {
    socket.on("init-config", (data) => {
        action(data);
    });

    socket.emit("load-grid", {
        name: config.name,
        grid: config.grid,
        pieces: config.pieces,
    });
}

const firing = (normalizedCoords) => {
    if (socket && data.myturno === true) {
        socket.emit("firing", normalizedCoords);
    }
}

const update_game = (action) => {
    socket.on("update-game", (data) => {
        action(data);
    });
}

const connect_error = (action) => {
    socket.on('connect_error', (data) => {
        action();
        disconnect();
    });

    socket.on('another_player_disconnected', (data) => {
        action();
        disconnect();
    });
}

const disconnect = () => {
    if(socket) {
        socket.close();
        socket = false;
    }
}