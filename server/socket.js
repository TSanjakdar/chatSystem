const fs = require('fs');

module.exports = {
    connect: (io) => {

        // read JSON
        var storedData;
        fs.readFile('./assets/storedData.JSON', (err, data) => {
            if(err) throw(err);
            storedData = JSON.parse(data);
            console.log(storedData);
        });
        
        var user = {};
        user.username = '';
        user.email = '';
        user.role;
        user.valid = false;
        var userList = [];
        var userGroups = [];
        var userChannels = [];
        var inChannel = '';
        var inGroup = '';

        var chat = io.of('/chat');
        chat.on('connection', (socket) => {

            // Update fields
            socket.on('update', () => {
                // update list of all users
                userList = [];
                for(i=0; i<storedData.users.length; i++){
                    userList.push(storedData.users[i].username);
                }
                chat.emit('getUsers', userList);
                
                // update lists of groups and groups user has access to
                userGroups = [];
                allGroups = [];
                for(i=0; i<storedData.groups.length; i++){
                    allGroups.push(storedData.groups[i].name);
                    if(storedData.groups[i].members.includes(user.username)){
                        userGroups.push(storedData.groups[i].name);
                    }
                }
                chat.emit('userGroups', userGroups);
                chat.emit('allGroups', allGroups);

                // update lists of channels in current group
                if(inGroup){
                    userChannels = [];
                    for(i=0; i<storedData.channels.length; i++){
                        if(storedData.channels[i].members.includes(user.username) && storedData.channels[i].group == inGroup){
                            userChannels.push(storedData.channels[i].name);
                        }
                    }
                    chat.emit('userChannels', userChannels);
                }
            });
            
            // collect user data from JSON
            socket.on('login', (username, res) => {
                userGroups = [];
                allGroups = [];
                userList = [];
                for(i=0; i<storedData.users.length; i++){
                    userList.push(storedData.users[i].username);
                    if(storedData.users[i].username == username){
                        user.valid = true;
                        user.username = storedData.users[i].username;
                        user.email = storedData.users[i].email;
                        user.role = storedData.users[i].role;
                        chat.emit('userLoggedIn', user);
                    }
                }
                res(user);
                // get groups user has been invited to for toolbar
                for(i=0; i<storedData.groups.length; i++){
                    allGroups.push(storedData.groups[i].name);
                    if(storedData.groups[i].members.includes(user.username)){
                        userGroups.push(storedData.groups[i].name)
                    }
                }
                chat.emit('allGroups', allGroups);
                chat.emit('userGroups', userGroups);
                chat.emit('getUsers', userList);
            });

            // when group is joined
            socket.on('getChannels', (groupList) => {
                chat.emit('groupJoined', groupList);
                inGroup = groupList;
                userChannels = [];
                usersInGroup = [];
                // get all users in group for dashboard
                for(i=0; i<storedData.groups.length; i++){
                    if(storedData.groups[i].name == groupList){
                        usersInGroup = storedData.groups[i].members;
                    }
                }
                // iterate through all channels
                for(i=0; i<storedData.channels.length; i++){
                    // check if channel is in selected group
                    if(storedData.channels[i].group == groupList){
                        // check if user is invited to channel
                        if(storedData.channels[i].members.includes(user.username)){
                            userChannels.push(storedData.channels[i].name);
                        }
                    }
                }
                chat.emit('getUsersInGroup', usersInGroup);
                chat.emit('groupJoined', groupList);
                chat.emit('userChannels', userChannels);
            });

            // join a channel from toolbar
            socket.on('joinChannel', (channel) => {
                inChannel = channel;
                // refresh list of users in channel
                usersInChannel = [];
                for(i=0; i<storedData.channels.length; i++){
                    if(storedData.channels[i].name == inChannel && storedData.channels[i].group == inGroup){
                        usersInChannel = storedData.channels[i].members;
                    }
                }
                chat.emit('getUsersInChannel', usersInChannel);
                chat.emit('channelJoined', channel);
            });

            // create new user
            socket.on('createUser', (username, email, role) => {
                let user = {"username": username, "email": email, "role": role};
                storedData.users.push(user);
                fs.writeFile('./assets/storedData.JSON', JSON.stringify(storedData), function(err){
                    if(err){
                        console.log('fail');
                    }
                });
            });

            // change user's role
            socket.on('editUser', (userToEdit, updatedRole) => {
                for(i=0; i<storedData.users.length; i++){
                    if(userToEdit == storedData.users[i].username){
                        storedData.users[i].role = updatedRole;
                    }
                };
                fs.writeFile('./assets/storedData.JSON', JSON.stringify(storedData), function(err){
                    if(err){
                        console.log('fail');
                    }
                });
            });

            // delete user - user also removed from groups and channels
            socket.on('deleteUser', (userToDelete) => {
                for(i=0; i<storedData.users.length; i++){
                    if(userToDelete == storedData.users[i].username){
                        storedData.users.splice(i, 1);
                    }
                };
                for(i=0; i<storedData.groups.length; i++){
                    if(storedData.groups[i].members.includes(userToDelete)){
                        userIndex = storedData.groups[i].members.indexOf(userToDelete);
                        storedData.groups[i].members.splice(userIndex, 1);
                    }
                };
                for(i=0; i<storedData.channels.length; i++){
                    if(storedData.channels[i].members.includes(userToDelete)){
                        userIndex = storedData.channels[i].members.indexOf(userToDelete);
                        storedData.channels[i].members.splice(userIndex, 1);
                    }
                };
                fs.writeFile('./assets/storedData.JSON', JSON.stringify(storedData), function(err){
                    if(err){
                        console.log('fail');
                    }
                });
            });

            // create new group - current user automatically added to list of invited users
            socket.on('createGroup', (groupName) => {
                newGroup = {"name": groupName, "members": [user.username]}
                storedData.groups.push(newGroup);
                fs.writeFile('./assets/storedData.JSON', JSON.stringify(storedData), function(err){
                    if(err){
                        console.log('fail');
                    }
                });
            });

            // delete group
            socket.on('deleteGroup', (groupName) => {
                for(i=0; i<storedData.groups.length; i++){
                    if(storedData.groups[i].name == groupName){
                        storedData.groups.splice(i, 1);
                    }
                }
                fs.writeFile('./assets/storedData.JSON', JSON.stringify(storedData), function(err){
                    if(err){
                        console.log('fail');
                    }
                });
            });
            
            // invite user to group
            socket.on('inviteToGroup', (groupName, user) => {
                for(i=0; i<storedData.groups.length; i++){
                    if(storedData.groups[i].name == groupName){
                        if(storedData.groups[i].members.includes(user)){
                            break;
                        }
                        else{
                            storedData.groups[i].members.push(user);
                        }
                    }
                }
                fs.writeFile('./assets/storedData.JSON', JSON.stringify(storedData), function(err){
                    if(err){
                        console.log('fail');
                    }
                });

                // refresh list of users in group
                usersInGroup = [];
                for(i=0; i<storedData.groups.length; i++){
                    if(storedData.groups[i].name == inGroup){
                        usersInGroup = storedData.groups[i].members;
                    }
                }
                chat.emit('getUsersInGroup', usersInGroup);
            });
            
            // remove user from group
            socket.on('removeFromGroup', (groupName, user) => {
                for(i=0; i<storedData.groups.length; i++){
                    if(storedData.groups[i].name == groupName){
                        for(x=0; x<storedData.groups[i].members.length; x++){
                            if(storedData.groups[i].members[x] == user){
                                storedData.groups[i].members.splice(x, 1);
                            }
                        }
                    }
                }
                fs.writeFile('./assets/storedData.JSON', JSON.stringify(storedData), function(err){
                    if(err){
                        console.log('fail');
                    }
                });

                // refresh list of users in group
                usersInGroup = [];
                for(i=0; i<storedData.groups.length; i++){
                    if(storedData.groups[i].name == inGroup){
                        usersInGroup = storedData.groups[i].members;
                    }
                }
                chat.emit('getUsersInGroup', usersInGroup);
            });

            // create new channel - current user automatically added to list of invited users
            socket.on('createChannel', (channelName, group) => {
                newChannel = {"name": channelName, "group": group, "members": [user.username]}
                storedData.channels.push(newChannel);
                fs.writeFile('./assets/storedData.JSON', JSON.stringify(storedData), function(err){
                    if(err){
                        console.log('fail');
                    }
                });
            });

            // delete channel
            socket.on('deleteChannel', (channelName) => {
                for(i=0; i<storedData.channels.length; i++){
                    if(storedData.channels[i].name == channelName){
                        storedData.channels.splice(i, 1);
                    }
                }
                fs.writeFile('./assets/storedData.JSON', JSON.stringify(storedData), function(err){
                    if(err){
                        console.log('fail');
                    }
                });
            });
            
            // invite user to channel
            socket.on('inviteToChannel', (channelName, user) => {
                for(i=0; i<storedData.channels.length; i++){
                    if(storedData.channels[i].name == channelName){
                        if(storedData.channels[i].members.includes(user)){
                            break;
                        }
                        else{
                            storedData.channels[i].members.push(user);
                        }
                    }
                }
                fs.writeFile('./assets/storedData.JSON', JSON.stringify(storedData), function(err){
                    if(err){
                        console.log('fail');
                    }
                });

                // refresh list of users in channel
                usersInChannel = [];
                for(i=0; i<storedData.channels.length; i++){
                    if(storedData.channels[i].name == inChannel){
                        usersInChannel = storedData.channels[i].members;
                    }
                }
                chat.emit('getUsersInChannel', usersInChannel);
            });
            
            // remove user from channel
            socket.on('removeFromChannel', (channelName, user) => {
                for(i=0; i<storedData.channels.length; i++){
                    if(storedData.channels[i].name == channelName){
                        for(x=0; x<storedData.channels[i].members.length; x++){
                            if(storedData.channels[i].members[x] == user){
                                storedData.channels[i].members.splice(x, 1);
                            }
                        }
                    }
                }
                fs.writeFile('./assets/storedData.JSON', JSON.stringify(storedData), function(err){
                    if(err){
                        console.log('fail');
                    }
                });

                // refresh list of users in channel
                usersInChannel = [];
                for(i=0; i<storedData.channels.length; i++){
                    if(storedData.channels[i].name == inChannel){
                        usersInChannel = storedData.channels[i].members;
                    }
                }
                chat.emit('getUsersInChannel', usersInChannel);
            });
        });
    }
}