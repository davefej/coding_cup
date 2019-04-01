const express = require('express')
const app = express()
const port = 3000
const game = require('./game.js')
const tcp = require('./tcp.js')
var RUNNING = false;
var PENDING_HTTP_RESPS = [];

app.use(express.static('public'));
app.use(express.json());

app.post('/startorstop', function(req, res){ 
    RUNNING = !RUNNING;
    if(RUNNING){
        tcp.connect(onJsonMessage);
        setTimeout(function(){                 
            //initial message
            tcp.sendJson(game.getFirstMessage());
        },100);
    }else{
        tcp.close();
    }
    res.end(RUNNING ? "START" : "STOP");
});

app.get('/wait_for_thick', function(req, res){ 
    PENDING_HTTP_RESPS.push(res);
});

onJsonMessage = function(data){
    changeDirection(data);
    console.log("car passanger:"+data.cars[0].passenger_id);
    var stepData = game.calculateNextStep(data);     
    var httpResp = PENDING_HTTP_RESPS.pop();
    if(httpResp  && !httpResp.finished){
        httpResp.send({
            thick:data,
            sent:stepData,
            info:game.getInfo()
        });
        httpResp.end();
    }
    //timeout, not to kill local TCP socket with infinite running
    setTimeout(function(){
        if(tcp.sendJson(stepData)){
            console.log("STEP COMMAND SENT:",stepData.response_id.tick);
            
        }
    },100);
}

function changeDirection(data){
    for(var i = 0; i < data.cars.length; i++){
        data.cars[i].direction = cDir(data.cars[i].direction);
    }
    for(var i = 0; i < data.pedestrians.length; i++){
        data.pedestrians[i].direction = cDir(data.pedestrians[i].direction);
    }
}

function cDir(dir){
    switch(dir){
        case "DOWN":
            return DOWN;
        case "RIGHT":
            return RIGHT;
        case "LEFT":
            return LEFT;
        case "UP":
            return UP;
    }
}

app.listen(port, () => console.log(`Example app listening on port ${port}!`))