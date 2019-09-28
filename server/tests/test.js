const app = require('../server.js');
const chai = require('chai');
const expect = require('chai').expect;
const should = chai.should();
const io = require('socket.io-client');

var socketUrl = 'http://localhost:3000/chat';
var socketConnection = io.connect(socketUrl);

describe('server side socket testing', () => {
    before(() => {
        console.log('test starting');
    });
    after(() => {
        console.log('test finished');
    });
    describe('logout endpoint', () => {
        it('it should respond with status of 200', (done) => {
            socketConnection.on('logout', function(res){
                res.should.have.status(200);
            });
            socketConnection.disconnect();
            done();
        });
        it('it should return an object', (done) => {
            socketConnection.emit('something', function(res){
            });
            socketConnection.disconnect();
            done();
        });
    });
});