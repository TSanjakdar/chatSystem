import { Component, OnInit } from '@angular/core';
import { SocketService } from '../services/socket.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {

  username = '';

  constructor(private socketService: SocketService) { }

  ngOnInit() {
  }

  login(username){
    console.log('user is: ' + username)
    this.socketService.login(username, function(res){
      if(res){
        console.log('YES')
        sessionStorage.setItem('username', username);
      }
      else{
        console.log('NO')
      }
    });
  }

}
