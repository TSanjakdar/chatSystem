const express = require('express');
const app = express();
const cors = require('cors');
const http = require('http').Server(app);
const io = require ('socket.io')(http);
const sockets = require('./socket.js');
const server = require('./listen.js');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
var port = 3000;
const MongoClient = require('mongodb').MongoClient;
var  ObjectID = require('mongodb').ObjectID;

app.use(bodyParser.json());
app.use(cors());
app.use(express.static('http://localhost:4200'));

const url = 'mongodb://localhost:27017/chatdb';
var Schema = mongoose.Schema;
var db = mongoose.connection;
mongoose.connect(url, {useNewUrlParser: true});
db.on('error', console.error.bind(console, 'connection error'));
db.once('open', () => {

    // ----- Initiate schemas ----- //
    var usersSchema = new Schema({
        username: {type: String, required: true, unique: true},
        password: {type: String, required: true},
        email: {type: String, required: true, unique: true},
        role: Number
    });
    var User = mongoose.model('User', usersSchema);

    var groupsSchema = new Schema({
        name: {type: String, required: true},
        members: [{type: Schema.Types.ObjectId, ref: 'User'}]
    });
    var Group = mongoose.model('Group', groupsSchema);

    var channelsSchema = new Schema({
        name: {type: String, required: true},
        group: {type: Schema.Types.ObjectId, ref: 'Group'},
        members: [{type: Schema.Types.ObjectId, ref: 'User'}]
    });
    var Channel = mongoose.model('Channel', channelsSchema);

    var chatsSchema = new Schema({
        channel: {type: Schema.Types.ObjectId, ref: 'Channel'},
        messages: [{
            user: {type: Schema.Types.ObjectId, ref: 'User'}, 
            message: String
        }]
    });
    var Chat = mongoose.model('Chat', chatsSchema);

    // ----- Initial data ----- //
    // users
    var superUser = new User({username: 'super', password: '123', email: 'super@admin.com', role: 3});
    var tariqUser = new User({username: "Tariq", password: '123', email: "tariq@email.com", role: 2});
    var newUserUser = new User({username: "newUser", password: '123', email: "new@user.com", role: 1});
    var tariq1User = new User({username: "Tariq1", password: '123', email: "a@a.com", role: 0});
    // superUser.save();
    // tariqUser.save();
    // newUserUser.save();
    // tariq1User.save();

    // groups
    var group1 = new Group({name: 'group1', members: [superUser]});
    var group2 = new Group({name: "group2", members: [superUser, newUserUser]});
    var group3 = new Group({name: "group3", members: [tariqUser]});
    var group4 = new Group({name: "group4", members: [superUser, tariq1User]});
    // group1.save();
    // group2.save();
    // group3.save();
    // group4.save();

    // channels
    var channel1 = new Channel({name: 'channel1', group: group1, members: [superUser]});
    var channel2 = new Channel({name: 'channel2', group: group1, members: [superUser]});
    var channel3 = new Channel({name: 'channel3', group: group2, members: [newUserUser]});
    var channel4 = new Channel({name: 'channel4', group: group2, members: [superUser, newUserUser]});
    var channel5 = new Channel({name: 'channel5', group: group3, members: [tariqUser]});
    // channel1.save();
    // channel2.save();
    // channel3.save();
    // channel4.save();
    // channel5.save();
    
    sockets.connect(io, User, Group, Channel, Chat);
    server.listen(http, port);
});

