import { Component, OnInit } from '@angular/core';
import { SocketService } from '../services/socket.service';

@Component({
  selector: 'app-chat',
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.css']
})
export class ChatComponent implements OnInit {

    message = '';
    chat = [];
    constructor(private socketService: SocketService) { }

    ngOnInit() {
        this.socketService.getChatHistory((ch) => {
            for(let i = 0; i < ch.length; i++){
                this.chat.push(ch[i])
            }
        });
        this.socketService.getChat((c)=>this.chat.push(c));
    }

    sendMessage(){
        if(this.message){
            this.socketService.sendMessage(this.message);
            this.message = '';
        }
        else{
            alert('please type a message to send');
        }
    }
}
