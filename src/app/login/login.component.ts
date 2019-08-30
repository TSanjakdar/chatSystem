import { Component, OnInit } from '@angular/core';
import { SocketService } from '../services/socket.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {

  username = '';

  constructor(private socketService: SocketService, private router: Router) { }

  ngOnInit() {
  }

  // function to login - data is collected from serverand then stored in local storage
  login(username){
    console.log('user is: ' + username)
    this.socketService.login(username, (user) => {
      if(user.valid){
        console.log(user)
        console.log('user valid');
        localStorage.setItem('username', user.username);
        localStorage.setItem('email', user.email);
        localStorage.setItem('role', user.role);
        this.router.navigateByUrl("/dash");
      }
      else{
        console.log('user invalid');
        this.username = '';
        alert("username doesn't exist");
      }
    });
  }

}
