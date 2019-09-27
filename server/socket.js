const fs = require('fs');
module.exports = {
    connect: (io, User, Group, Channel, Chat) => {

        var user = {};
        user.id = '';
        user.username = '';
        user.email = '';
        user.role;
        user.valid = false;
        var userList = [];
        var userGroups = [];
        var userChannels = [];
        var inChannel = '';
        var inGroup = '';

        // USERS - _id:<objid>, username:'', password:'', email:'', role:#
        var userCollection;
        // GROUPS - _id:<objid>, name:'', members:[<objid>, <objid>...]
        var groupCollection;
        // CHANNELS - _id:<objid>, name:'', group:<objid>, members:[<objid>, <objid>...]
        var channelCollection;
        // CHATS - _id:<objid>, channel:<objid>, messages:[{username:<objid>, message:''}, {username:<objid>, message:''}...]
        var chatCollection;

        // read JSON
        var storedData;
        fs.readFile('./assets/storedData.JSON', (err, data) => {
            if(err) throw(err);
            storedData = JSON.parse(data);
        });

        var chat = io.of('/chat');
        chat.on('connection', (socket) => {

            // Update fields
            socket.on('update', async () => {
                // update list of all users
                userList = [];
                await User.find({}, (err, res) => {
                    if(err) return console.error(err);
                    for(i = 0; i < res.length; i++){
                        userList.push(res[i].username)
                    }
                });

                // for(i=0; i<storedData.users.length; i++){
                //     userList.push(storedData.users[i].username);
                // }
                chat.emit('getUsers', userList);
                
                // update lists of groups and groups user has access to
                userGroups = [];
                allGroups = [];

                await Group.find({}, (err, res) => {
                    if(err) return console.error(err);
                    for(i = 0; i < res.length; i++){
                        allGroups.push(res[i].name);
                        if(res[i].members.includes(user.id)){
                            userGroups.push(res[i].name);
                        }
                    }
                });
                // for(i=0; i<storedData.groups.length; i++){
                //     allGroups.push(storedData.groups[i].name);
                //     if(storedData.groups[i].members.includes(user.username)){
                //         userGroups.push(storedData.groups[i].name);
                //     }
                // }
                chat.emit('userGroups', userGroups);
                chat.emit('allGroups', allGroups);

                // update lists of channels in current group
                if(inGroup){
                    userChannels = [];

                    await Channel.find({}, (err, res) => {
                        if(err) return console.error(err);
                        for(i = 0; i < res.length; i++){
                            if(res[i].members.includes(user.username) && res[i].group == inGroup){
                                userChannels.push(res[i].name);
                            }
                        }
                    })

                    // for(i=0; i<storedData.channels.length; i++){
                    //     if(storedData.channels[i].members.includes(user.username) && storedData.channels[i].group == inGroup){
                    //         userChannels.push(storedData.channels[i].name);
                    //     }
                    // }
                    chat.emit('userChannels', userChannels);
                }
            });

            socket.on('logout', () => {
                user = {};
                user.id = '';
                user.username = '';
                user.email = '';
                user.role;
                user.valid = false;
            });
            
            // collect user data from DB
            socket.on('login', async (username, password, res) => {
                console.log('login started');
                console.log('username is ' + username, 'password is ' + password);
                userGroups = [];
                allGroups = [];
                userList = [];
                await User.find({}, (err, res) => {
                    if(err) return console.error(err);
                    for(i = 0; i < res.length; i++){
                        userList.push(res[i].username);
                        if(res[i].username == username && res[i].password == password){
                            user.valid = true;
                            user.username = res[i].username;
                            user.email = res[i].email;
                            user.role = res[i].role;
                            user.id = res[i]._id
                            chat.emit('userLoggedIn', user);
                        }
                    }
                });

                // for(i=0; i<storedData.users.length; i++){
                //     userList.push(storedData.users[i].username);
                //     if(storedData.users[i].username == username){
                //         user.valid = true;
                //         user.username = storedData.users[i].username;
                //         user.email = storedData.users[i].email;
                //         user.role = storedData.users[i].role;
                //         chat.emit('userLoggedIn', user);
                //     }
                // }

                res(user);

                // get groups user has been invited to for toolbar

                await Group.find({}, (err, res) => {
                    if(err) return console.error(err);
                    for(i = 0; i < res.length; i++){
                        allGroups.push(res[i].name);
                        if(res[i].members.includes(user.id)){
                            userGroups.push(res[i].name);
                        }
                    }
                });

                // for(i=0; i<storedData.groups.length; i++){
                //     allGroups.push(storedData.groups[i].name);
                //     if(storedData.groups[i].members.includes(user.username)){
                //         userGroups.push(storedData.groups[i].name)
                //     }
                // }

                chat.emit('allGroups', allGroups);
                chat.emit('userGroups', userGroups);
                chat.emit('getUsers', userList);
            });

            // when group is joined
            socket.on('getChannels', async (groupList) => {
                chat.emit('groupJoined', groupList);
                inGroup = groupList;
                userChannels = [];
                usersInGroup = [];
                let groupUserIds = [];
                let groupId = '';
                // get all users and channels in group for dashboard
                await Group.findOne({name: inGroup}, (err, res) => {
                    if(err) return console.error(err);
                    groupId = res._id;
                    groupUserIds = res.members;
                });
                await User.find({_id: {$in: groupUserIds}}, (err, res) => {
                    if(err) return console.error(err);
                    for(i = 0; i < res.length; i++){
                        usersInGroup.push(res[i].username);
                    }
                });
                await Channel.find({group: groupId, members: user.id}, (err, res) => {
                    if(err) return console.error(err);
                    for(i = 0; i < res.length; i++){
                        userChannels.push(res[i].name);
                    }
                });

                // for(i=0; i<storedData.groups.length; i++){
                //     if(storedData.groups[i].name == groupList){
                //         usersInGroup = storedData.groups[i].members;
                //     }
                // }

                // iterate through all channels
                // for(i=0; i<storedData.channels.length; i++){
                //     // check if channel is in selected group
                //     if(storedData.channels[i].group == groupList){
                //         // check if user is invited to channel
                //         if(storedData.channels[i].members.includes(user.username)){
                //             userChannels.push(storedData.channels[i].name);
                //         }
                //     }
                // }
                chat.emit('getUsersInGroup', usersInGroup);
                chat.emit('groupJoined', groupList);
                chat.emit('userChannels', userChannels);
            });

            // join a channel from toolbar
            socket.on('joinChannel', async (channel) => {
                inChannel = channel;
                usersInChannel = [];
                let channelUserIds = [];
                let channelId = '';

                // get all users in channel
                await Channel.findOne({name: inChannel}, (err, res) => {
                    if(err) return console.error(err);
                    channelId = res._id;
                    channelUserIds = res.members;
                });
                await User.find({_id: {$in: channelUserIds}}, (err, res) => {
                    if(err) return console.error(err);
                    for(i = 0; i < res.length; i++){
                        usersInChannel.push(res[i].username);
                    }
                });
                // refresh list of users in channel
                // for(i=0; i<storedData.channels.length; i++){
                //     if(storedData.channels[i].name == inChannel && storedData.channels[i].group == inGroup){
                //         usersInChannel = storedData.channels[i].members;
                //     }
                // }
                chat.emit('getUsersInChannel', usersInChannel);
                chat.emit('channelJoined', channel);
            });

            // create new user
            socket.on('createUser', async (newUsername, newPassword, newEmail, newRole) => {
                let user = await new User({username: newUsername, password: newPassword, email: newEmail, role: newRole});
                user.save();

                // storedData.users.push(user);
                // fs.writeFile('./assets/storedData.JSON', JSON.stringify(storedData), function(err){
                //     if(err){
                //         console.log('fail');
                //     }
                // });
            });

            // change user's role
            socket.on('editUser', (userToEdit, updatedRole) => {
                User.findOneAndUpdate({username: userToEdit}, {role: updatedRole}, () => {});
                // for(i=0; i<storedData.users.length; i++){
                //     if(userToEdit == storedData.users[i].username){
                //         storedData.users[i].role = updatedRole;
                //     }
                // };
                // fs.writeFile('./assets/storedData.JSON', JSON.stringify(storedData), function(err){
                //     if(err){
                //         console.log('fail');
                //     }
                // });
            });

            // delete user - user also removed from groups and channels
            socket.on('deleteUser', async (userToDelete) => {
                let deltedUsersId = '';
                await User.findOneAndDelete({username: userToDelete}, (err, res) => {
                    if(err) return console.error(err);
                    deltedUsersId = res._id;
                });
                await Group.update({members: deltedUsersId}, {$pull: {members: deltedUsersId}}, () => {});
                await Channel.update({members: deltedUsersId}, {$pull: {members: deltedUsersId}}, () => {});

                // for(i=0; i<storedData.users.length; i++){
                //     if(userToDelete == storedData.users[i].username){
                //         storedData.users.splice(i, 1);
                //     }
                // };
                // for(i=0; i<storedData.groups.length; i++){
                //     if(storedData.groups[i].members.includes(userToDelete)){
                //         userIndex = storedData.groups[i].members.indexOf(userToDelete);
                //         storedData.groups[i].members.splice(userIndex, 1);
                //     }
                // };
                // for(i=0; i<storedData.channels.length; i++){
                //     if(storedData.channels[i].members.includes(userToDelete)){
                //         userIndex = storedData.channels[i].members.indexOf(userToDelete);
                //         storedData.channels[i].members.splice(userIndex, 1);
                //     }
                // };
                // fs.writeFile('./assets/storedData.JSON', JSON.stringify(storedData), function(err){
                //     if(err){
                //         console.log('fail');
                //     }
                // });
            });

            // create new group - current user automatically added to list of invited users
            socket.on('createGroup', async (groupName) => {
                let newGroup = await new Group({name: groupName, members: [user.id]});
                newGroup.save();

                // storedData.groups.push(newGroup);
                // fs.writeFile('./assets/storedData.JSON', JSON.stringify(storedData), function(err){
                //     if(err){
                //         console.log('fail');
                //     }
                // });
            });

            // delete group and all channels in group
            socket.on('deleteGroup', async (groupName) => {
                let deletedGroupsId = '';
                await Group.findOneAndDelete({name: groupName}, (err, res) => {
                    if(err) return console.error(err);
                    deletedGroupsId = res._id;
                });
                await Channel.deleteMany({group: deletedGroupsId}, () => {});
                // for(i=0; i<storedData.groups.length; i++){
                //     if(storedData.groups[i].name == groupName){
                //         storedData.groups.splice(i, 1);
                //     }
                // }
                // fs.writeFile('./assets/storedData.JSON', JSON.stringify(storedData), function(err){
                //     if(err){
                //         console.log('fail');
                //     }
                // });
            });
            
            // invite user to group
            socket.on('inviteToGroup', async (groupName, user) => {
                let usersId = '';
                await User.findOne({username: user}, (err, res) => {
                    usersId = res._id;
                });
                await Group.findOneAndUpdate({name: groupName}, {$push: {members: usersId}}, () => {});
                // for(i=0; i<storedData.groups.length; i++){
                //     if(storedData.groups[i].name == groupName){
                //         if(storedData.groups[i].members.includes(user)){
                //             break;
                //         }
                //         else{
                //             storedData.groups[i].members.push(user);
                //         }
                //     }
                // }
                // fs.writeFile('./assets/storedData.JSON', JSON.stringify(storedData), function(err){
                //     if(err){
                //         console.log('fail');
                //     }
                // });

                // refresh list of users in group
                usersInGroup = [];
                let groupUserIds = [];
                let groupId = '';
                await Group.findOne({name: groupName}, (err, res) => {
                    if(err) return console.error(err);
                    groupId = res._id;
                    groupUserIds = res.members;
                });
                await User.find({_id: {$in: groupUserIds}}, (err, res) => {
                    if(err) return console.error(err);
                    for(i = 0; i < res.length; i++){
                        usersInGroup.push(res[i].username);
                    }
                });
                // for(i=0; i<storedData.groups.length; i++){
                //     if(storedData.groups[i].name == inGroup){
                //         usersInGroup = storedData.groups[i].members;
                //     }
                // }
                chat.emit('getUsersInGroup', usersInGroup);
            });
            
            // remove user from group
            socket.on('removeFromGroup', async (groupName, user) => {
                await Group.findOneAndUpdate({name: groupName}, {$pull: {members: user}}, () => {});
                // for(i=0; i<storedData.groups.length; i++){
                //     if(storedData.groups[i].name == groupName){
                //         for(x=0; x<storedData.groups[i].members.length; x++){
                //             if(storedData.groups[i].members[x] == user){
                //                 storedData.groups[i].members.splice(x, 1);
                //             }
                //         }
                //     }
                // }
                // fs.writeFile('./assets/storedData.JSON', JSON.stringify(storedData), function(err){
                //     if(err){
                //         console.log('fail');
                //     }
                // });

                // refresh list of users in group
                usersInGroup = [];
                let groupUserIds = [];
                let groupId = '';
                await Group.findOne({name: groupName}, (err, res) => {
                    if(err) return console.error(err);
                    groupId = res._id;
                    groupUserIds = res.members;
                });
                await User.find({_id: {$in: groupUserIds}}, (err, res) => {
                    if(err) return console.error(err);
                    for(i = 0; i < res.length; i++){
                        usersInGroup.push(res[i].username);
                    }
                });
                // for(i=0; i<storedData.groups.length; i++){
                //     if(storedData.groups[i].name == inGroup){
                //         usersInGroup = storedData.groups[i].members;
                //     }
                // }
                chat.emit('getUsersInGroup', usersInGroup);
            });

            // create new channel - current user automatically added to list of invited users
            socket.on('createChannel', async (channelName, group) => {
                let groupId = '';
                await Group.findOne({name: group}, (err, res) => {
                    if(err) return console.error(err);
                    groupId = res._id;
                });
                let newChannel = await new Channel({name: channelName, group: groupId, members: [user.id]});
                newChannel.save();

                // storedData.channels.push(newChannel);
                // fs.writeFile('./assets/storedData.JSON', JSON.stringify(storedData), function(err){
                //     if(err){
                //         console.log('fail');
                //     }
                // });
            });

            // delete channel
            socket.on('deleteChannel', async (channelName) => {
                await Channel.findOneAndDelete({name: channelName}, () => {});
                // for(i=0; i<storedData.channels.length; i++){
                //     if(storedData.channels[i].name == channelName){
                //         storedData.channels.splice(i, 1);
                //     }
                // }
                // fs.writeFile('./assets/storedData.JSON', JSON.stringify(storedData), function(err){
                //     if(err){
                //         console.log('fail');
                //     }
                // });
            });
            
            // invite user to channel
            socket.on('inviteToChannel', async (channelName, user) => {
                let usersId = '';
                await User.findOne({username: user}, (err, res) => {
                    usersId = res._id;
                });
                await Channel.findOneAndUpdate({name: channelName}, {$push: {members: usersId}}, () => {});
                // for(i=0; i<storedData.channels.length; i++){
                //     if(storedData.channels[i].name == channelName){
                //         if(storedData.channels[i].members.includes(user)){
                //             break;
                //         }
                //         else{
                //             storedData.channels[i].members.push(user);
                //         }
                //     }
                // }
                // fs.writeFile('./assets/storedData.JSON', JSON.stringify(storedData), function(err){
                //     if(err){
                //         console.log('fail');
                //     }
                // });

                // refresh list of users in channel
                usersInChannel = [];
                let channelUserIds = [];
                let channelId = '';

                await Channel.findOne({name: channelName}, (err, res) => {
                    if(err) return console.error(err);
                    channelId = res._id;
                    channelUserIds = res.members;
                });
                await User.find({_id: {$in: channelUserIds}}, (err, res) => {
                    if(err) return console.error(err);
                    for(i = 0; i < res.length; i++){
                        usersInChannel.push(res[i].username);
                    }
                });
                // for(i=0; i<storedData.channels.length; i++){
                //     if(storedData.channels[i].name == inChannel){
                //         usersInChannel = storedData.channels[i].members;
                //     }
                // }
                chat.emit('getUsersInChannel', usersInChannel);
            });
            
            // remove user from channel
            socket.on('removeFromChannel', async (channelName, user) => {
                await Channel.findOneAndUpdate({name: channelName}, {$pull: {members: user}}, () => {});
                // for(i=0; i<storedData.channels.length; i++){
                //     if(storedData.channels[i].name == channelName){
                //         for(x=0; x<storedData.channels[i].members.length; x++){
                //             if(storedData.channels[i].members[x] == user){
                //                 storedData.channels[i].members.splice(x, 1);
                //             }
                //         }
                //     }
                // }
                // fs.writeFile('./assets/storedData.JSON', JSON.stringify(storedData), function(err){
                //     if(err){
                //         console.log('fail');
                //     }
                // });

                // refresh list of users in channel
                usersInChannel = [];
                let channelUserIds = [];
                let channelId = '';

                await Channel.findOne({name: channelName}, (err, res) => {
                    if(err) return console.error(err);
                    channelId = res._id;
                    channelUserIds = res.members;
                });
                await User.find({_id: {$in: channelUserIds}}, (err, res) => {
                    if(err) return console.error(err);
                    for(i = 0; i < res.length; i++){
                        usersInChannel.push(res[i].username);
                    }
                });
                // for(i=0; i<storedData.channels.length; i++){
                //     if(storedData.channels[i].name == inChannel){
                //         usersInChannel = storedData.channels[i].members;
                //     }
                // }
                chat.emit('getUsersInChannel', usersInChannel);
            });
        });
    }
}