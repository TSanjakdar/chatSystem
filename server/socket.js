const fs = require('fs');

module.exports = {
    connect: function(io){
        var storedData;
        fs.readFile('./assets/storedData.JSON', function(err, data){
            if(err) throw(err);
            storedData = JSON.parse(data);
        });
        var chat = io.of('/chat');
        chat.on('connection', function(socket){
            
            socket.on('message', function(res){
                res(storedData);
            });

            socket.on('login', function(username, res){
                valid = false;
                for(i=0; i<storedData.users.length; i++){
                    if(storedData.users[i].username == username){
                        valid = true;
                    }
                }
                res(valid);
            });
        });
    }
}