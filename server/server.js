const express = require('express');
const app = express();
const cors = require('cors');
const http = require('http').Server(app);
const io = require ('socket.io')(http);
const sockets = require('./socket.js');
const server = require('./listen.js');
const bodyParser = require('body-parser');
const MongoClient = require('mongodb').MongoClient;
const url = 'mongodb://localhost:27017';
var  ObjectID = require('mongodb').ObjectID;
var port = 3000;

app.use(bodyParser.json());
app.use(cors());
app.use(express.static(__dirname + '/routes'));

MongoClient.connect(url, function(err, client){
    if(err){return console.log(err)}
    const dbName = 'chatdb';
    const db = client.db(dbName);

    app.get('/', function(){
        // USERS - _id:<obj1>, username:'', password:'', email:'', role:#
        db.createCollection('users', function(err, res){
            if(err){return console.log(err)}
            console.log('users collection created');
        });
        // GROUPS - _id:<obj2>, name:'', members:[<obj1>,<obj1>...]
        db.createCollection('groups', function(err, res){
            if(err){return console.log(err)}
            console.log('groups collection created');
        });
        // CHANNELS - _id:<obj3>, name:'', group:<obj2>, members:[<obj1>, <obj1>...]
        db.createCollection('channels', function(err, res){
            if(err){return console.log(err)}
            console.log('channels collection created');
        });
        // CHATS - _id:<obj4>, channel:<obj3>, messages:{<obj1>:''}
        db.createCollection('chats', function(err, res){
            if(err){return console.log(err)}
            console.log('chats collection created');
        });
    });
    sockets.connect(io, db);
    server.listen(http, port);
});