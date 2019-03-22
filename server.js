const express = require('express')
const app = express()
const port = 3000
const game = require('./game.js')
const tcp = require('./tcp.js')

app.use(express.static('public'))
var RECEIVED_THICK_DATA = "";

app.get('/wait_for_thick', function(req, res){    
    res.end(RECEIVED_THICK_DATA);
});

onTcpMessage = function(data){
    console.log("THICK ARRIVED:",data);
    RECEIVED_THICK_DATA = data;
    var stepData = game.calculateNextStep(data);    
    //timeout for not to kill local TCP infinite loop
    setTimeout(function(){
        tcp.write(stepData);
        console.log("STEP COMMAND SENT:",data);
    },500);    
}

tcp.connect(onTcpMessage);
//initial message
setTimeout(function(){
    tcp.write({
        token:"1234"
    });    
},200)

app.listen(port, () => console.log(`Example app listening on port ${port}!`))

