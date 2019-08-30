import { Component } from '@angular/core';
import { SocketService } from './services/socket.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  constructor(private socketService: SocketService, private router: Router){}
  
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
    this.router.navigateByUrl('/');
  }

  joinGroup(){
    this.socketService.joinGroup(this.groupList);
  }

  joinChannel(){
    this.socketService.joinChannel(this.channelList);
  }

  enterChat(){
    this.router.navigateByUrl('/chat');
    this.chatJoined = true;
  }

  leaveChat(){
    this.router.navigateByUrl('/dash');
    this.chatJoined = false;
  }

}
