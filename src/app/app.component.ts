import { Component } from '@angular/core';
import { SocketService } from './services/socket.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent{
    constructor(private socketService: SocketService, private router: Router){}
    
    selectedImage;
    user = {};
    inGroup = '';
    groups = [];
    groupList = '';
    inChannel = '';
    channels = [];
    channelList = '';
    chatJoined = false;

    ngOnInit() {
        this.socketService.getUser((user) => {this.user = user});
        this.socketService.getChannels((userChannels) => {this.channels = userChannels});
        this.socketService.getGroups((groups) => {this.groups = groups});
        this.socketService.groupJoined((group) => {this.inGroup = group});
        this.socketService.channelJoined((channel) => {this.inChannel = channel});
    }

    logout(){
        localStorage.clear();
        this.user = {};
        this.inGroup = '';
        this.inChannel = '';
        this.chatJoined = false;
        this.socketService.logout();
        this.router.navigateByUrl('/');
    }

    joinGroup(){
        this.inGroup = this.groupList;
        this.socketService.joinGroup(this.groupList);
    }

    joinChannel(){
        this.inChannel = this.channelList;
        this.socketService.joinChannel(this.channelList);
    }

    enterChat(){
        this.router.navigateByUrl('/chat');
        this.chatJoined = true;
        this.socketService.enterChat(this.inChannel);
    }

    leaveChat(){
        this.router.navigateByUrl('/dash');
        this.chatJoined = false;
        this.socketService.exitChat(this.inChannel);
    }

    // imageSelected(e){
    //     var file = e.originalEvent.target.files[0], 
    //     reader = new FileReader();
    //     reader.onload = function(evt){
    //         var jsonObject = {'imageData': evt.target.result}
    //         console.log(jsonObject)
    //     }
    //     console.log(file)
    // }

}
