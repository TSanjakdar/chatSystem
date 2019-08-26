module.exports = {
    listen: function(http, port){
        http.listen(port, function(){
            var d = new Date();
            var h = d.getHours();
            var m = d.getMinutes();
            console.log('Server has started at: ' + h + ':' + m);
        });
    }
}