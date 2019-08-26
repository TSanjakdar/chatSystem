import { Component } from '@angular/core';
import { SocketService } from './services/socket.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  constructor(private socketService: SocketService){}
  
  username = '';

  ngOnInit() {
    this.username = sessionStorage.getItem('username');
  }

  // test(){
  //   this.socketService.sendMessage(function(data){
  //     console.log(data)
  //   })
  // }
}
