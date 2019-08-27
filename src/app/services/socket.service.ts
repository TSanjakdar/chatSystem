import { Injectable } from '@angular/core';
import * as io from 'socket.io-client';

@Injectable({
  providedIn: 'root'
})

export class SocketService {

  private socket = io('http://localhost:3000/chat');

  constructor() { }

  login(username, user){
    this.socket.emit('login', username, user);
  }

  getUser(user){
    this.socket.on('userLoggedIn', obj => user(obj));
  }

  getChannels(list){
    this.socket.on('userChannels', channels => list(channels));
  }

  joinGroup(groupList){
    this.socket.emit('getChannels', groupList)
  }

}
