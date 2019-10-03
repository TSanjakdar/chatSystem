const app = require('../server.js');
const chai = require('chai');
const expect = require('chai').expect;
const should = chai.should();
const io = require('socket.io-client');

var socketUrl = 'http://localhost:3000/chat';

describe('server side socket testing', () => {
    var socketConnection;
    beforeEach(function(done) {
        socketConnection = io.connect(socketUrl, {
            'reconnection delay' : 0
            , 'reopen delay' : 0
            , 'force new connection' : true
        });
        socketConnection.on('connect', function() {
            console.log('connected');
            done();
        });
        socketConnection.on('disconnect', function() {
            console.log('disconnected');
        })
    });
    afterEach(function(done) {
        if(socketConnection.connected) {
            console.log('disconnecting');
            socketConnection.disconnect();
        } 
        else {
            console.log('no connection');
        }
        done();
    });

    describe('login', () => {
        it('it should respond with an object', (done) => {
            socketConnection.emit('login', 'Tariq', '123', (res) => {
                expect(res).to.be.a('object');
                done();
            });
        });
        it('object should contain specific properties', (done) => {
            socketConnection.emit('login', 'Tariq', '123', (res) => {
                expect(res).to.have.property('id');
                expect(res).to.have.property('username');
                expect(res).to.have.property('email');
                expect(res).to.have.property('valid');
                done();
            });
        });
        it('valid should be true', (done) => {
            socketConnection.emit('login', 'Tariq', '123', (res) => {
                expect(res.valid).to.equal(true);
                done();
            });
        });
    });
});