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


var gameId = 1;
var car_id = 1;
function createServer(){
/***** LOCAL TCP SERVER JUST FOR TESTING *******/
    gameId++;
    car_id++;
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
                    }else if(requestData.response_id.tick != dev_server_thick_id){
                        console.error("Thick Id not equal",dev_server_thick_id,requestData.thick);
                    }
                    socket.write(JSON.stringify({
                        "request_id": {
                          "game_id": gameId,
                          "tick": ++dev_server_thick_id,
                          "car_id": car_id
                        },
                        "cars": [
                          {
                            "id": car_id,
                            "pos": {"x": 0, "y": 0},
                            "life": 100,
                            "speed": 2,
                            "direction": ">",
                            "next_command": "+",
                            "transported": "100",
                            "passenger_id": "1"
                          }
                        ],
                        "pedestrians": [
                          {
                            "id": 100,
                            "pos": {"x": 10, "y": 10},
                            "speed": 1,
                            "direction": ">",
                            "next_command": "+"
                          }, 
                        ],
                        "passengers": [
                          {
                            "id": 101,
                            "pos": {"x": 30, "y": 30},
                            "dest_pos": {"x": 40, "y": 40},
                            "car_id":car_id
                          }
                        ],
                        "messages": []
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