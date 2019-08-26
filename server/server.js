const express = require('express');
const app = express();
const cors = require('cors');
const http = require('http').Server(app);
const io = require ('socket.io')(http);
const sockets = require('./socket.js');
const server = require('./listen.js');

var port = 3000;

app.use(express.static('http://localhost:4200'));
app.use(cors());
sockets.connect(io);
server.listen(http, port);