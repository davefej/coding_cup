const net = require('net');
var split = require('split');
var client;
var IP = '127.0.0.1';
var PORT = 1337;
var server;
var dev_server_thick_id;

module.exports = {
    connect(onMessage){
        dev_server_thick_id = 0;
        client = new net.Socket();           
        client.connect(PORT, IP, function() {
            console.log('TCP Client Connected sucessfully');
        });
        client.on('data', function(data) {            
            onMessage(JSON.parse(data.toString()));            
        });        
        client.on('close', function() {            
            console.error("Connection closed!");     
        });
    },
    sendJson(msg){
        if(client.destroyed){            
            console.error("Cannot write to closed connetion");
            return false;
        }
        client.write(JSON.stringify(msg));
        client.pipe(split())
        return true;
    },
    close(){
        console.error("destroy connection!");
        client.destroy();        
    }
};



function createServer(){
/***** LOCAL TCP SERVER JUST FOR TESTING *******/
    if(IP == '127.0.0.1' && server == undefined){             
        let firstReqest = true;
        server = net.createServer(function(socket) {                           
            socket.on('data', function(data) {
                var requestData = JSON.parse(data.toString());                
                if(firstReqest && !requestData.token){                
                    socket.write(JSON.stringify({
                        messages:["NOT_SENT_TOKEN"]
                    }));
                    console.error("Initial request without token");
                }else{
                    if(firstReqest){
                        firstReqest = false;
                    }else if(requestData.thick != dev_server_thick_id){
                        console.error("Thick Id not equal",dev_server_thick_id,requestData.thick);
                    }
                    socket.write(JSON.stringify({
                        txt:"Map informations",
                        thick: ++dev_server_thick_id
                    }));     
                }
                socket.pipe(split());
            });
            socket.on("close",function(data){
                socket.pipe(split());
            })    
        });
        server.listen(PORT, IP).on('error', console.error);
    }
}
createServer();