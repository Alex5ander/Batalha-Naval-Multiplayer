const { createServer } = require('http');
const { Server } = require('socket.io');
const express = require('express');
const registerEvents = require('./src/events');

const app = express();
const server = createServer(app);

app.use(express.static('public'));

server.listen(3000, function () {
  console.log(
    '** Server is listening on localhost:3000, open your browser on http://localhost:3000/ **'
  );
});

const io = new Server(server);

registerEvents(io);
