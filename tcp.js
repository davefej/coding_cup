const net = require('net');
const client = new net.Socket();

var IP = '127.0.0.1';
var PORT = 1337;

module.exports = {
    connect(onMessage){
        
        client.connect(PORT, IP, function() {
            console.log('TCP Client Connected sucessfully');
        });
        client.on('data', function(data) {
            
            console.log("Client ondata",data.toString())
            onMessage(JSON.parse(data.toString()));
            
        });        
        client.on('close', function() {            
            console.error("Connection closed!");         
        });
    },
    write(msg){
        if(client.destroyed){
            throw Error("Cannot write to closed connetion");
        }
        client.write(JSON.stringify(msg));
    },
    close(){
        client.destroy();
    }
};

/***** LOCAL TCP SERVER JUST FOR TESTING *******/
if(IP == '127.0.0.1'){
    let thick_id = 0;
    let firstReqest = true;
    let server = net.createServer(function(socket) {
        console.log('TCP Server created sucessfully');               
        socket.on('data', function(data) {
            var requestData = JSON.parse(data.toString());
            console.log("requestData",requestData)
            if(firstReqest && !requestData.token){                
                socket.write(JSON.stringify({
                    messages:["NOT_SENT_TOKEN"]
                }));
                console.error("Initial request without token");
            }else{
                if(firstReqest){
                    firstReqest = false;
                }else if(requestData.thick != thick_id){
                    console.error("Thick Id not equal",thick_id,requestData.thick);
                }
                socket.write(JSON.stringify({
                    txt:"Map informations",
                    thick: ++thick_id
                }));     
            }
            socket.pipe(socket);          
        });
        
    });
    server.listen(PORT, IP);
}