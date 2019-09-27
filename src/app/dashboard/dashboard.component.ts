import { Component, OnInit } from '@angular/core';
import { SocketService } from '../services/socket.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {

  users = [];
  userRole = localStorage.getItem('role');
  // user section variables
  userGroups = [];
  newUsername = '';
  newPassword = '';
  newEmail = '';
  newRole = '';
  updatedUser = '';
  changedRole = '';
  deletedUser = '';
  // group section variables
  allGroups = [];
  usersInGroup = [];
  joinedGroup = '';
  newGroupName = '';
  groupToDelete = '';
  inviteUserToGroup = '';
  removeUserFromGroup = '';
  // channel section variables
  channels = [];
  usersInChannel = [];
  inChannel = '';
  newChannelName = '';
  channelToDelete = '';
  inviteUserToChannel = '';
  removeUserFromChannel = '';

  constructor(private socketService: SocketService, private router: Router) { }

  ngOnInit() {
    this.socketService.getGroups((groups) => {this.userGroups = groups});
    this.socketService.getAllGroups((groups) => {this.allGroups = groups});
    this.socketService.groupJoined((group) => {this.joinedGroup = group});
    this.socketService.channelJoined((channel) => {this.inChannel = channel});
    this.socketService.getUsers((users) => {this.users = users});
    this.socketService.getChannels((channels) => {this.channels = channels});
    this.socketService.getUsersInGroup((users) => {this.usersInGroup = users});
    this.socketService.getUsersInChannel((users) => {this.usersInChannel = users});
  }

  // function to create new user - user's role assigned number based on role - if username already exists, user is not created
  createUser(){
    if(this.users.includes(this.newUsername)){
      alert('user already exists')
    }
    else{
      let role;
      if(this.newRole == 'General User'){
        role = 0;
      }
      if(this.newRole == 'Group Assist'){
        role = 1;
      }
      if(this.newRole == 'Group Admin'){
        role = 2;
      }
      if(this.newRole == 'Super Admin'){
        role = 3;
      }
      this.socketService.createUser(this.newUsername, this.newPassword, this.newEmail, role);
      this.newUsername = '';
      this.newPassword = '';
      this.newEmail = '';
      this.newRole = '';
      alert('New user has been created');
    }
  }

  // function to edit user's role - numbered role assigned the same as create user
  editUser(){
    let role;
    if(this.changedRole == 'General User'){
      role = 0;
    }
    if(this.changedRole == 'Group Assist'){
      role = 1;
    }
    if(this.changedRole == 'Group Admin'){
      role = 2;
    }
    if(this.changedRole == 'Super Admin'){
      role = 3;
    }
    this.socketService.editUser(this.updatedUser, role);
    this.updatedUser = '';
    this.changedRole = '';
    alert("user's role has been edited");
  }

  // function to delete user. user also removed from groups and channels
  deleteUser(){
    this.socketService.deleteUser(this.deletedUser);
    this.deletedUser = '';
    alert('User has been deleted');
  }

  // function to create group
  createGroup(){
    this.socketService.createGroup(this.newGroupName);
    this.newGroupName = '';
    alert("Group has been created and you are currently it's only invited member");
  }

  // function to delete group
  deleteGroup(){
    this.socketService.deleteGroup(this.groupToDelete);
    this.groupToDelete = '';
    alert('Group has been deleted');
  }

  // function to invite user to group - user must join group before other users can be invited
  inviteToGroup(){
    this.socketService.inviteToGroup(this.joinedGroup, this.inviteUserToGroup);
    this.inviteUserToGroup = '';
    alert('User has been added to group');
  }

  // function to remove user to group - user must join group before other users can be removed
  removeFromGroup(){
    this.socketService.removeFromGroup(this.joinedGroup, this.removeUserFromGroup);
    this.removeUserFromGroup = '';
    alert('User has been removed from group');
  }

  // function to create a new channel - user must be in a group before channel can be created
  createChannel(){
    this.socketService.createChannel(this.newChannelName, this.joinedGroup);
    this.newChannelName = '';
    alert("Channel has been created and you are currently it's only invited member");
  }

  // function to delete a channel - user must join group before channels can be removed
  deleteChannel(){
    this.socketService.deleteChannel(this.channelToDelete);
    this.channelToDelete = '';
    alert('Channel has been deleted');
  }

  // function to invite user to channel - user must join channel before other users can be invited
  inviteToChannel(){
    this.socketService.inviteToChannel(this.inChannel, this.inviteUserToChannel);
    this.inviteUserToChannel = '';
    alert('User has been added to Channel');
  }

  // function to remove user to channel - user must join channel before other users can be removed
  removeFromChannel(){
    this.socketService.removeFromChannel(this.inChannel, this.removeUserFromChannel);
    this.removeUserFromChannel = '';
    alert('User has been removed from channel');
  }
}
