const express = require('express')
const app = express()
const port = 3000
const game = require('./game.js')
const tcp = require('./tcp.js')
const CollisionDetector = require('./public/collisionDetector.js');
var fs = require("fs");
var RUNNING = false;
var PENDING_HTTP_RESPS = [];
var GAMNELOG = [];
var CAR_STATUS_LOGS = [];
app.use(express.static('public'));
app.use(express.json());

const USE_CLIENT = true;
const stepTimeOut = 0;//millisec
const ELES = true;

lastThickTime = new Date();

app.post('/startorstop', function(req, res){    
    if(!RUNNING){
        onConnect = function(){
            setTimeout(function(){                 
                //initial message
                lastThickTime = new Date();
                console.log("Sending first message");
                tcp.sendJson(game.getFirstMessage(ELES));
            },100);
        };
        tcp.connect(onJsonMessage,onCloseMessage,onConnect);
        GAMNELOG = [];
        CAR_STATUS_LOGS = [];
        
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
    var thicktime = Math.round((new Date()-lastThickTime));
    if(thicktime > 150){
        console.log("Thick Eltelt idő ",thicktime,"[millisec]");
    }    
    lastThickTime = new Date();
    changeDirection(data);
    var stepData = game.calculateNextStep(data);
    GAMNELOG.push({
        thick:data,
        step:stepData,
        info: game.getInfo()
    });
    if(data.request_id){
        if(data.request_id.car_id != undefined){
            //CAR_STATUS_LOGS.push(CollisionDetector.getStatus(data.request_id.car_id, data));
        }
    }
    var httpResp = PENDING_HTTP_RESPS.shift();
    if(USE_CLIENT && httpResp  && !httpResp.finished){
        httpResp.send({
            thick:data,
            sent:stepData,
            info:game.getInfo()
        });
        httpResp.end();
    }    
    if(stepTimeOut > 0){
        setTimeout(function(){
            tcp.sendJson(stepData);
        },stepTimeOut);        
    }else{
        tcp.sendJson(stepData);        
    }
    
}

function changeDirection(data){
    if(!data.cars){
        console.error(data);
    }
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
        default: 
            return dir;
    }
}
function onCloseMessage(){
    fs.writeFileSync("./logs/log_"+GAMNELOG[0].thick.request_id.game_id,JSON.stringify(GAMNELOG));
    fs.writeFileSync("./logs/status_log_"+GAMNELOG[0].thick.request_id.game_id,
                    JSON.stringify(CAR_STATUS_LOGS.filter((o)=>{return o.life!=0;})));
    console.log("Leállás oka:",GAMNELOG[GAMNELOG.length-1].thick.messages);
    setTimeout(function(){
        if(PENDING_HTTP_RESPS.length > 0){
            PENDING_HTTP_RESPS.shift().send({end:1});
        }        
    },500);    
}

app.listen(port, () => console.log(`Example app listening on port ${port}!`))