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
  channels = [];
  group = '';
  channelList = '';

  ngOnInit() {
    this.socketService.getUser((user) => {this.user = user});
    this.socketService.getChannels((userChannels) => {this.channels = userChannels});
  }

  logout(){
    sessionStorage.clear();
    this.user = {};
    this.router.navigateByUrl('/');
  }

  joinGroup(groupList){
    console.log(groupList)
    this.socketService.joinGroup(groupList);
  }

}
