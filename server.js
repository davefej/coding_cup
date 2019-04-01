const express = require('express')
const app = express()
const port = 3000
const game = require('./game.js')
const tcp = require('./tcp.js')
var fs = require("fs");
var RUNNING = false;
var PENDING_HTTP_RESPS = [];
var GAMNELOG = [];
app.use(express.static('public'));
app.use(express.json());

app.post('/startorstop', function(req, res){    
    if(!RUNNING){
        tcp.connect(onJsonMessage,onCloseMessage);
        GAMNELOG = [];
        setTimeout(function(){                 
            //initial message
            tcp.sendJson(game.getFirstMessage());
        },100);
    }else{
        tcp.close();
    }
    RUNNING = !RUNNING;
    res.end(RUNNING ? "START" : "STOP");
});

app.get('/wait_for_thick', function(req, res){ 
    PENDING_HTTP_RESPS.push(res);
});

app.get('/loadGames', function(req, res){ 
    var ret = [];
    fs.readdirSync("./logs").forEach(file => {
        var content = fs.readFileSync("./logs/"+file);
        ret.push(JSON.parse(content));
    });
    res.end(JSON.stringify(ret));
});


onJsonMessage = function(data){
    changeDirection(data);
    var stepData = game.calculateNextStep(data);
    GAMNELOG.push({
        thick:data,
        step:stepData
    });
    var httpResp = PENDING_HTTP_RESPS.shift();
    if(httpResp  && !httpResp.finished){
        httpResp.send({
            thick:data,
            sent:stepData,
            info:game.getInfo()
        });
        httpResp.end();
    }    
    setTimeout(function(){
        tcp.sendJson(stepData);
    },200);
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
function onCloseMessage(){
    fs.writeFileSync("./logs/log_"+GAMNELOG[0].thick.request_id.game_id,JSON.stringify(GAMNELOG));
    //TODO init
}

app.listen(port, () => console.log(`Example app listening on port ${port}!`))