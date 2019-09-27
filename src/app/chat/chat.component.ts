import { Component, OnInit } from '@angular/core';
import { SocketService } from '../services/socket.service';

@Component({
  selector: 'app-chat',
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.css']
})
export class ChatComponent implements OnInit {

    user = localStorage.getItem('username')
    inChannel = localStorage.getItem(this.user+'channel');
    message = '';
    chat = [];
    constructor(private socketService: SocketService) { }

    ngOnInit() {
        this.socketService.getChat((c)=>this.chat.push(c));
    }

    sendMessage(){
        if(this.message){
            this.socketService.sendMessage(this.message, this.inChannel);
            this.message = '';
        }
        else{
            alert('please type a message to send');
        }
    }
}
