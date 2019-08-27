const fs = require('fs');

module.exports = {
    connect: (io) => {
        var storedData;
        fs.readFile('./assets/storedData.JSON', (err, data) => {
            if(err) throw(err);
            storedData = JSON.parse(data);
            console.log(storedData)
            for(i=0; i<storedData.groups.length; i++){
                key = Object.keys(storedData.groups[i])[0]
                console.log(key)
                console.log(storedData.groups[i][key].length)
            }
        });
        
        var user = {};
        user.username = '';
        user.email = '';
        user.role = '';
        user.groups = [];
        user.valid = false;
        var subGroups = [];
        var channels = []

        var chat = io.of('/chat');
        chat.on('connection', (socket) => {
            
            socket.on('login', (username, res) => {
                for(i=0; i<storedData.users.length; i++){
                    if(storedData.users[i].username == username){
                        user.valid = true;
                        user.username = storedData.users[i].username;
                        user.email = storedData.users[i].email;
                        user.role = storedData.users[i].role;
                        user.groups = storedData.users[i].groups;
                        chat.emit('userLoggedIn', user);
                    }
                }
                res(user);
            });

            socket.on('getChannels', (groupList) => {
                // iterate through all groups
                for(y=0; y<storedData.groups.length; y++){
                    // get group title
                    key = Object.keys(storedData.groups[y])[0]
                    //  if selected group matches group within all groups
                    if(groupList == key){
                        // access that group object, iterate through
                        for(z=0; z<storedData.groups[y][key].length; z++){
                            // if property within object is string (channel) push to array
                            if(typeof(storedData.groups[y][key][z]) == "string"){
                                channels.push(storedData.groups[y][key][z]);
                                chat.emit('userChannels', channels);
                            }
                        }
                    }
                }
            })

        });
    }
}