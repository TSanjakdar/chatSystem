module.exports = {
    connect: function(io){
        var chat = io.of('/chat');
        chat.on('connection', (socket) => {
            socket.on('message', (message) => {
                chat.emit('message', message);
            });
        });
    }
}