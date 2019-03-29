const express = require('express')
const app = express()
const port = 3000
const game = require('./game.js')
const tcp = require('./tcp.js')
var RUNNING = false;
var PENDING_HTTP_RESP;

app.use(express.static('public'));
app.use(express.json());

app.post('/startorstop', function(req, res){ 
    RUNNING = !RUNNING;
    if(RUNNING){
        game.setMap(req.body.gameMap);
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
    PENDING_HTTP_RESP = res;
});

onJsonMessage = function(data){
    console.log("THICK ARRIVED:",data);
    if(PENDING_HTTP_RESP && !PENDING_HTTP_RESP.finished){
        PENDING_HTTP_RESP.send(data);
        PENDING_HTTP_RESP.end();
    }

    var stepData = game.calculateNextStep(data);     
    //timeout, not to kill local TCP socket with infinite running
    setTimeout(function(){
        if(tcp.sendJson(stepData)){
            console.log("STEP COMMAND SENT:",data); 
        }
    },100);    
}

app.listen(port, () => console.log(`Example app listening on port ${port}!`))