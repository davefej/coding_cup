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
            tcp.sendJson({
                token:"1234"
            });    
        },300);
    }else{
        tcp.close();
    }
    res.end(RUNNING ? "START" : "STOP");    
});

app.get('/wait_for_thick', function(req, res){ 
    if(!RUNNING){
        res.end("NOT RUNNING");
    }else{
        PENDING_HTTP_RESP = res;
    }
});

onJsonMessage = function(data){
    console.log("THICK ARRIVED:",data);
    var stepData = game.calculateNextStep(data); 
    //timeout not to kill local TCP infinite loop
    setTimeout(function(){
        if(tcp.sendJson(stepData)){
            console.log("STEP COMMAND SENT:",data); 
        }      
    },1000);
    if(PENDING_HTTP_RESP && !PENDING_HTTP_RESP.finished){
        PENDING_HTTP_RESP.send(data);
        PENDING_HTTP_RESP.end();
    }    
}



app.listen(port, () => console.log(`Example app listening on port ${port}!`))

