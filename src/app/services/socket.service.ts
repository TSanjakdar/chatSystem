import { Injectable } from '@angular/core';
import * as io from 'socket.io-client';

@Injectable({
  providedIn: 'root'
})

export class SocketService {

    private socket = io('http://localhost:3000/chat');

    constructor() { }

    updateFields(){
        this.socket.emit('update');
    }

    login(username, password, user){
        this.socket.emit('login', username, password, user);
    }

    logout(){
        this.socket.emit('logout');
    }

    getUser(user){
        this.socket.on('userLoggedIn', obj => user(obj));
    }

    getGroups(groups){
        this.socket.on('userGroups', array => groups(array));
    }

    getAllGroups(groups){
        this.socket.on('allGroups', array => groups(array));
    }

    getChannels(list){
        this.socket.on('userChannels', channels => list(channels));
    }

    joinGroup(groupList){
        this.socket.emit('getChannels', groupList);
    }

    groupJoined(group){
        this.socket.on('groupJoined', joinedGroup => group(joinedGroup));
    }

    joinChannel(channelList){
        this.socket.emit('joinChannel', channelList);
    }

    channelJoined(channel){
        this.socket.on('channelJoined', inChannel => channel(inChannel));
    }

    createUser(username, password, email, role){
        this.socket.emit('createUser', username, password, email, role);
        this.updateFields();
    }

    getUsers(userList){
        this.socket.on('getUsers', users => userList(users));
    }

    editUser(userToEdit, updatedRole){
        this.socket.emit('editUser', userToEdit, updatedRole);
        this.updateFields();
    }

    deleteUser(userToDelete){
        this.socket.emit('deleteUser', userToDelete);
        this.updateFields();
    }

    createGroup(groupName){
        this.socket.emit('createGroup', groupName);
        this.updateFields();
    }

    deleteGroup(groupName){
        this.socket.emit('deleteGroup', groupName);
        this.updateFields();
    }

    inviteToGroup(groupName, user){
        this.socket.emit('inviteToGroup', groupName, user);
    }

    removeFromGroup(groupName, user){
        this.socket.emit('removeFromGroup', groupName, user);
    }

    getUsersInGroup(usersInGroup){
        this.socket.on('getUsersInGroup', users => usersInGroup(users));
    }

    createChannel(channelName, group){
        this.socket.emit('createChannel', channelName, group);
        this.updateFields();
    }

    deleteChannel(channelName){
        this.socket.emit('deleteChannel', channelName);
        this.updateFields();
    }

    inviteToChannel(channelName, user){
        this.socket.emit('inviteToChannel', channelName, user);
    }

    removeFromChannel(channelName, user){
        this.socket.emit('removeFromChannel', channelName, user);
    }

    getUsersInChannel(usersInChannel){
        this.socket.on('getUsersInChannel', users => usersInChannel(users));
    }
    
    enterChat(channel){
        this.socket.emit('chatJoined', channel);
    }

    exitChat(channel){
        this.socket.emit('leftChat', channel);
    }

    sendMessage(message){
        this.socket.emit('message', message);
    }

    getChat(chat){
        this.socket.on('message', message => chat(message));
    }
}
