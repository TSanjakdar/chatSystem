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

  ngOnInit() {
    this.socketService.getUser((user) => {this.user = user});
    this.socketService.getChannels((userChannels) => {this.channels = userChannels});
    this.socketService.getGroups((groups) => {this.groups = groups});
  }

  logout(){
    sessionStorage.clear();
    this.user = {};
    this.router.navigateByUrl('/');
  }

  joinGroup(){
    this.socketService.joinGroup(this.groupList);
  }

}
