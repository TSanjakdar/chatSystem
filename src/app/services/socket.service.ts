import { Injectable } from '@angular/core';
import * as io from 'socket.io-client';

@Injectable({
  providedIn: 'root'
})
export class SocketService {

  private socket = io('http://localhost:3000/chat');

  constructor() { }

  login(username, res){
    this.socket.emit('login', username, res)
  }

  sendMessage(res){
    this.socket.emit('message', res);
  }

  getChat(){
    this.socket.on('message');
  }

}
