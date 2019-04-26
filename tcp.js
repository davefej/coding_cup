const net = require('net');
var split = require('split');
var fs = require('fs');

var client;

const local = false;
var IP = local ? '127.0.0.1' : '10.100.1.150';
var PORT = local ? 1337 : 12323;

var server;

module.exports = {
    connect(onMessage,onClose){
        dev_server_thick_id = 0;
        client = new net.Socket();
        client.pipe(split());
        client.setKeepAlive(true);
        firstReqest = true;
        client.connect(PORT, IP, function() {
            console.log('TCP Client Connected sucessfully');
        });
        client.on('data', function(data) {
            onMessage(JSON.parse(data.toString()));
        });        
        client.on('close', function() {            
            console.error("Connection closed!");
            onClose();  
        });
    },
    sendJson(msg){
        if(client.destroyed){            
            console.error("Cannot write to closed connetion");
            return false;
        }
        client.write(JSON.stringify(msg));        
        return true;
    },
    close(){
        console.error("destroy connection!");
        client.destroy();
    }
};


/**
 * LOCAL TCP SERVER JUST FOR TESTING
 */
function createServer(){
    if(IP == '127.0.0.1' && server == undefined){             
        
        /**
         * Load a saved game
         */
        let firstReqest = true;
        const gameLogFile='./logs/log_17532';
        var savedTicks = JSON.parse(fs.readFileSync(gameLogFile));
        
        const fakeGameId = Math.floor(Math.random()*1e8 + 1e7);
        for(var data of savedTicks){
            data.thick.request_id.game_id = fakeGameId;
        }

        /** set futureCar to undefined */
        for(var data of savedTicks){
            for(var car of data.thick.cars){
                car.futureCar = undefined;
            }
        }

        /**
         * Generate fake cars
         */
        function addFakeCars(thick){
            fakeCars = [{id: -1, pos: {x: 2, y: 1}, direction: 'v', speed:0},
                        {id: -2, pos: {x: 51, y: 35}, direction: '^', speed:0},
                        {id: -3, pos: {x: 15, y: 52}, direction: '>', speed:0},
                        {id: -4, pos: {x: 3, y: 45}, direction: '^', speed:0}];
            
            for(let car of fakeCars){
                thick.cars.push(car);
            }
        }
        for(var data of savedTicks){
            addFakeCars(data.thick);
        }

        server = net.createServer(function(socket) {     
            var tickIdx = 0;                      
            socket.on('data', function(data) {
                var requestData = JSON.parse(data.toString());                
                if(firstReqest && !requestData.token){                
                    socket.write(JSON.stringify({
                        messages:["NOT_SENT_TOKEN"]
                    }));
                    console.error("Initial request without token");
                }else if (tickIdx == savedTicks.length){
                    socket.write(JSON.stringify({
                        messages: ["END_OF_DATA"]
                    }));
                }else{
                    if(firstReqest){
                        firstReqest = false;
                    }

                    //console.log('Sending tick:\n' + JSON.stringify(savedTicks[tickIdx].thick, null, 2));
                    socket.write(JSON.stringify(savedTicks[tickIdx++].thick));
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
