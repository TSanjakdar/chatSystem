import { Component, OnInit } from '@angular/core';
import { SocketService } from '../services/socket.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {

  userRole = sessionStorage.getItem('role');
  groups = [];

  constructor(private socketService: SocketService, private router: Router) { }

  ngOnInit() {
    this.socketService.getGroups((groups) => {this.groups = groups});
  }

}
