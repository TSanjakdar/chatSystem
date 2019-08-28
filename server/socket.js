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
        var groups = [];
        var channels = [];

        var chat = io.of('/chat');
        chat.on('connection', (socket) => {
            
            // collect user data from JSON
            socket.on('login', (username, res) => {
                groups = [];
                for(i=0; i<storedData.users.length; i++){
                    if(storedData.users[i].username == username){
                        user.valid = true;
                        user.username = storedData.users[i].username;
                        user.email = storedData.users[i].email;
                        user.role = storedData.users[i].role;
                        chat.emit('userLoggedIn', user);
                    }
                }
                res(user);
                // get groups user has been invited to
                for(i=0; i<storedData.groups.length; i++){
                    if(storedData.groups[i].members.includes(user.username)){
                        groups.push(storedData.groups[i].name)
                    }
                }
                chat.emit('userGroups', groups);
            });

            // when group is joined
            socket.on('getChannels', (groupList) => {
                channels = [];
                // iterate through all channels
                for(i=0; i<storedData.channels.length; i++){
                    // check if channel is in selected group
                    if(storedData.channels[i].group == groupList){
                        // check if user is invited to channel
                        if(storedData.channels[i].members.includes(user.username)){
                            channels.push(storedData.channels[i].name);
                        }
                    }
                }
                chat.emit('userChannels', channels);
            })

        });
    }
}