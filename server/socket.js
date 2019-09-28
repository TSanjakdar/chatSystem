module.exports = {
    connect: (io, User, Group, Channel, Chat) => {

        var user = {};
        user.id = '';
        user.username = '';
        user.email = '';
        user.picture = '';
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
            socket.on('update', async () => {
                // update list of all users
                userList = [];
                await User.find({}, (err, res) => {
                    if(err) return console.error(err);
                    for(let i = 0; i < res.length; i++){
                        userList.push(res[i].username)
                    }
                });
                chat.emit('getUsers', userList);
                
                // update lists of groups and groups user has access to
                userGroups = [];
                allGroups = [];

                await Group.find({}, (err, res) => {
                    if(err) return console.error(err);
                    for(let i = 0; i < res.length; i++){
                        allGroups.push(res[i].name);
                        if(res[i].members.includes(user.id)){
                            userGroups.push(res[i].name);
                        }
                    }
                });
                chat.emit('userGroups', userGroups);
                chat.emit('allGroups', allGroups);

                // update lists of channels in current group
                if(inGroup){
                    userChannels = [];

                    await Channel.find({}, (err, res) => {
                        if(err) return console.error(err);
                        for(let i = 0; i < res.length; i++){
                            if(res[i].members.includes(user.username) && res[i].group == inGroup){
                                userChannels.push(res[i].name);
                            }
                        }
                    });
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
                    for(let i = 0; i < res.length; i++){
                        userList.push(res[i].username);
                        if(res[i].username == username && res[i].password == password){
                            user.valid = true;
                            user.username = res[i].username;
                            user.email = res[i].email;
                            user.role = res[i].role;
                            user.picture = res[i].picture;
                            user.id = res[i]._id;
                            chat.emit('userLoggedIn', user);
                        }
                    }
                });

                res(user);

                // get groups user has been invited to for toolbar

                await Group.find({}, (err, res) => {
                    if(err) return console.error(err);
                    for(let i = 0; i < res.length; i++){
                        allGroups.push(res[i].name);
                        if(res[i].members.includes(user.id)){
                            userGroups.push(res[i].name);
                        }
                    }
                });

                chat.emit('allGroups', allGroups);
                chat.emit('userGroups', userGroups);
                chat.emit('getUsers', userList);
            });

            // when group is joined
            socket.on('getChannels', async (groupList) => {
                if(groupList){
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
                        for(let i = 0; i < res.length; i++){
                            usersInGroup.push(res[i].username);
                        }
                    });
                    await Channel.find({group: groupId, members: user.id}, (err, res) => {
                        if(err) return console.error(err);
                        for(let i = 0; i < res.length; i++){
                            userChannels.push(res[i].name);
                        }
                    });
                    chat.emit('getUsersInGroup', usersInGroup);
                    chat.emit('groupJoined', groupList);
                    chat.emit('userChannels', userChannels);
                }
            });

            // join a channel from toolbar
            socket.on('joinChannel', async (channel) => {
                if(channel){
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
                        for(let i = 0; i < res.length; i++){
                            usersInChannel.push(res[i].username);
                        }
                    });
                    chat.emit('getUsersInChannel', usersInChannel);
                    chat.emit('channelJoined', channel);
                }
            });

            // create new user
            socket.on('createUser', async (newUsername, newPassword, newEmail, newRole) => {
                let user = await new User({username: newUsername, password: newPassword, email: newEmail, role: newRole});
                user.save();
            });

            // change user's role
            socket.on('editUser', (userToEdit, updatedRole) => {
                User.findOneAndUpdate({username: userToEdit}, {role: updatedRole}, () => {});
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
            });

            // create new group - current user automatically added to list of invited users
            socket.on('createGroup', async (groupName) => {
                let newGroup = await new Group({name: groupName, members: [user.id]});
                newGroup.save();
            });

            // delete group and all channels in group
            socket.on('deleteGroup', async (groupName) => {
                let deletedGroupsId = '';
                await Group.findOneAndDelete({name: groupName}, (err, res) => {
                    if(err) return console.error(err);
                    deletedGroupsId = res._id;
                });
                await Channel.deleteMany({group: deletedGroupsId}, () => {});
            });
            
            // invite user to group
            socket.on('inviteToGroup', async (groupName, user) => {
                let usersId = '';
                await User.findOne({username: user}, (err, res) => {
                    usersId = res._id;
                });
                await Group.findOneAndUpdate({name: groupName}, {$push: {members: usersId}}, () => {});

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
                    for(let i = 0; i < res.length; i++){
                        usersInGroup.push(res[i].username);
                    }
                });
                chat.emit('getUsersInGroup', usersInGroup);
            });
            
            // remove user from group
            socket.on('removeFromGroup', async (groupName, user) => {
                let usersId = '';
                await User.findOne({username: user}, (err, res) => {
                    usersId = res._id;
                });
                await Group.findOneAndUpdate({name: groupName}, {$pull: {members: usersId}}, () => {});

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
                    for(let i = 0; i < res.length; i++){
                        usersInGroup.push(res[i].username);
                    }
                });
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

                userChannels = [];

                await Channel.find({}, (err, res) => {
                    if(err) return console.error(err);
                    for(let i = 0; i < res.length; i++){
                        if(res[i].members.includes(user.username) && res[i].group == inGroup){
                            userChannels.push(res[i].name);
                        }
                    }
                });
                chat.emit('update');
            });

            // delete channel
            socket.on('deleteChannel', async (channelName) => {
                await Channel.findOneAndDelete({name: channelName}, () => {});

                userChannels = [];

                await Channel.find({}, (err, res) => {
                    if(err) return console.error(err);
                    for(let i = 0; i < res.length; i++){
                        if(res[i].members.includes(user.username) && res[i].group == inGroup){
                            userChannels.push(res[i].name);
                        }
                    }
                });
            });
            
            // invite user to channel
            socket.on('inviteToChannel', async (channelName, user) => {
                let usersId = '';
                await User.findOne({username: user}, (err, res) => {
                    usersId = res._id;
                });
                await Channel.findOneAndUpdate({name: channelName}, {$push: {members: usersId}}, () => {});

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
                    for(let i = 0; i < res.length; i++){
                        usersInChannel.push(res[i].username);
                    }
                });
                chat.emit('getUsersInChannel', usersInChannel);
            });
            
            // remove user from channel
            socket.on('removeFromChannel', async (channelName, user) => {
                let usersId = '';
                await User.findOne({username: user}, (err, res) => {
                    if(err) return console.error(err);
                    usersId = res._id;
                });
                await Channel.findOneAndUpdate({name: channelName}, {$pull: {members: usersId}}, () => {});

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
                    for(let i = 0; i < res.length; i++){
                        usersInChannel.push(res[i].username);
                    }
                });
                chat.emit('getUsersInChannel', usersInChannel);
            });

            //chat
            socket.on('chatJoined', async (selectedChannel) => {
                let chatHistory = [];
                let channelid = '';
                await Channel.findOne({name: selectedChannel}, (err, res) => {
                    if(err) return console.error(err);
                    channelid = res._id;
                });
                await Chat.findOne({channel: channelid}, (err, res) => {
                    if(err) return console.error(err);
                    try{
                        chatHistory = res.messages;
                    }
                    catch{}
                });
                socket.join(selectedChannel);
                chat.to(selectedChannel).emit('chatHistory', chatHistory);
                let joinMsg = user.username + ' has joined the chat';
                chat.to(selectedChannel).emit('message', joinMsg);
            });

            socket.on('leftChat', (channel) => {
                let leftMsg = user.username + ' has left the chat';
                chat.to(channel).emit('message', leftMsg);
                socket.leave(channel);
            })

            socket.on('message', async (newMessage) => {
                let channelid = '';
                await Channel.findOne({name: inChannel}, (err, res) => {
                    if(err) return console.error(err);
                    channelid = res._id;
                });
                await Chat.findOneAndUpdate({channel: channelid}, {$push: {messages: newMessage}}, async (err, res) => {
                    if(err) return console.error(err);
                    if(res == null){
                        let newChatMessage = await new Chat({channel: channelid, messages: newMessage});
                        newChatMessage.save();
                    }
                });

                chat.to(inChannel).emit('message', newMessage);
            });
        });
    }
}