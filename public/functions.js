window.GAME = {
    gameMatrix:[],
    width:0,
    height:0,
    mapRatio:10,
    canvasContext:undefined,
    pathFinder:undefined,
    graph:createGraph(),
    myCar: undefined,
    myPassenger: undefined,
    lastLife: undefined
};

var POLL = false;
const ASZFALT = "S", ZEBRA = "Z", JÁRDA = "P",FŰ = "G", ÉPÜLET = "B", FA = "T";
const mapstr = "GPSSPGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGPSSPG#PPSSPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPSSPP#SSSSSSSSSSSSSSSSSSSSSSSSSSSSZSSZSSSSSSSSSSSSSSSSSSSSSSSSSSSS#SSSSSSSSSSSSSSSSSSSSSSSSSSSSZSSZSSSSSSSSSSSSSSSSSSSSSSSSSSSS#PPSSPPPZZPPPPPPPPPPPPPPPPPPPPSSPPPPPPPPPPPPPPPPPPPPZZPPPSSPP#GPSSPGPSSPGBBGBBGGBBGGBBGBBGPSSPGBBGBBGGBBGGBBGBBGPSSPBPSSPG#GPSSPBPSSPPPPPPPPPPPPPPPPPPPPSSPPPPPPPPPPPPPPPPPPPPSSPBPSSPG#GPSSPBPSSSSSSSSZSSZSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSPGPSSPG#GPSSPBPSSSSSSSSZSSZSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSPBPSSPG#GPSSPBPSSPPPPPPPSSPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPSSPBPSSPG#GPSSPGPSSSPPGBBPSSPGGGGGBBBBBGPPPPPPPPGGBBBBBBGBBPSSSPGPSSPG#GPSSPBPSSSSPPGBPSSPGTGPPPPPPPPPSSSSSSPPPBBBBBBGBBPSGSPBPSSPG#GPSSPBPPSSSSPPGPSSPGGGPSSSSSSSSSSSSSSSSPPPGGGPPPPPSGSPBPSSPG#GPSSPGGPPSSSSPPPSSPPBBPSSSSSSSSSSPPSSSSSSPPPGPSSSSSGSPGPSSPG#GPSSPGGGPPSSSSPSSSSPPPPSSPSSPPSSPPPPPSSSSSSPPPSSSSSSSPGPSSPG#GPSSPGGGGPPSSSSSBBSSSSSSSSSSPPSSSSSSPPPSSSSSSZSSPPPPPPGPSSPG#GPSSPGGGGGPPSSSSBBSSSSSSSSSSPPSPPPPSSSPPPSSSSZSSPPSSPGGPSSPG#GPSSPGGGGGGPPPPSSSSPPPPPPPPPPPSPPSSSSSSPPPPPPPSSPPSSPTTPSSPG#GPSSPGGGGGGGGGPPSSPPSSSSSSSSGPSSSSPPSSSSPPGTGPSSSSSSPTGPSSPG#GPSSPGGGGGGBBBGPSSSSSSSSSSSSSPPPPPPPPSSSSPPGPPSSSSSSPTTPSSPG#GPSSPGGGGGGBBBGPSSSSSSPPPPSSSSSSSSSSPPSSSSPPPSSSPPPPPTTPSSPG#GPSSPGGGGGGBBBGPSSPPPPPGGPPSSSSSSSSSSPPSSSSPSSSSPBBBBTGPSSPG#GPSSPGPPPPPPPPPPSSPGGGGGGGPPPPPPPPSSSSPPSSSSSSSPPBBBBBGPSSPG#GPSSPGPSSSSSSSSSSSPGGGGGGGGGGGBBGPPSSSSPPSSSSSPPGGGGGGGPSSPG#GPSSPGPSSSSSSSSSSSPGGGGBGGGGGGBBGGPPSSSSPPPPSSSPPPPPPGTPSSPG#GPSSPGPSSPPPPPPPSSPGGGGGGGGGGGGGGGGPPSSSSSSPSSSSSSSSPGTPSSPG#GPSSPGPSSPBGBBBPSSPGGGGGGGGGGPPPPGGGPPSSSSSPPSSSSSSSPGTPSSPG#GPSSPGPSSPBGBBBPSSPGGGGGGGGGPPSSPPGGGPPPPPPPPPPPPPZZPPGPSSPG#GPZZPPPZZPPPPPPPSSPPPPPPPPPPPSSSSPPPPPPPPPPPPPPPPSSSSPPPZZPG#GPSSSSSSSSSSSSSSSSSSSSSSSSSSSSBBSSSSSSSSSSSSSSSSSSBBSSSSSSPG#GPSSSSSSSSSSSSSSSSSSSSSSSSSSSSBBSSSSSSSSSSSSSSSSSSBBSSSSSSPG#GPZZPPPPPPPPPPPPPPPPSSPPPPPPPSSSSPPPPPPPSSPPPPPPPSSSSPPPZZPG#GPSSPGPSSSSPPBBBBPPSSSPGGPPPPPSSPPPPPGGPSSSPPGBBPPSSPPGPSSPG#GPSSPBPSSSSSPBBBBPSSSSPBBPSSSSSSSSSSPGGPSSSSPGBBGPSSPGBPSSPG#GPSSPBPPPSSSPGGGGPSSSPPGGPSSSSSSSSSSPGGPPSSSPGGGGPSSPGBPSSPG#GPSSPGGGPPSSPGGGGPSSPPGGGPSSPPPPPPSSPGGGPPSSPGGGGPSSPGBPSSPG#GPSSPGGBBPSSPGGGGPSSPGGGBPSSPGGGGPSSPGGGGPSSPGGGGPSSPGBPSSPG#GPSSPGGBBPSSPGGGGPSSPGBBBPSSPGGGGPSSPGGGGPSSPGGGGPSSPGBPSSPG#GPSSPGPPPPSSPPPPPPZZPPPPPPZZPPPPPPSSPPPPPPZZPPPPPPZZPPGPSSPG#GPSSPBPSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSZSSZSSSSSSSSPBPSSPG#GPSSPBPSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSZSSZSSSSSSSSPBPSSPG#GPSSPGPSSPPPPPSSPPPPPPPPPPPPZZPPPPPZZPPPPPSSPPPPPSSPPPBPSSPG#GPSSPBPSSPGGGPSSPGGGGGGGBBBPSSPGGGPSSPBBGPSSPGBBPSSPBGBPSSPG#GPSSPBPSSPGGGPSSPGGGGGGGBBBPSSPGGGPSSPBBGPSSPGBBPSSPBGBPSSPG#GPSSPGPSSPPPPPZZPPPPPPPPPPPPSSPPPPPSSPPPPPSSPPPPPSSPPGGPSSPG#GPSSPGPSSSSSSZSSZSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSPGBPSSPG#GPSSPGPSSSSSSZSSZSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSPGBPSSPG#GPSSPGPPSSPPPPZZPPPPSSPPPPZZPPPPSSPPPPPPPPPPSSPPPPZZPGBPSSPG#GPSSPGGPSSPBBPSSPBBPSSPGBPSSPBGPSSPGGGGGGGGPSSPGGPSSPGBPSSPG#GPSSPGGPSSPBBPSSPBBPSSPBBPSSPBGPSSPGGGGGGGGPSSPGGPSSPGBPSSPG#GPSSPGGPSSPPPPSSPPPPZZPPPPSSPPPPZZPPPPPPPPPPZZPPPPSSPGGPSSPG#GPSSPGGPSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSPPPGGPSSPG#GPSSPGGPSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSPGGGGPSSPG#GPSSPGGPPPPPPPPPPPPPPPPPPPPPPSSPPPPPPPPPPPPPPPPPPPPGGGGPSSPG#GPSSPGGGGGGGGGGGGGBBBBGGBBBBPSSPBBBBGGBBBBGGGGGGGGGGGGGPSSPG#PPSSPPPPPPPPPPPPPPPPPPPPPPPPPSSPPPPPPPPPPPPPPPPPPPPPPPPPSSPP#SSSSZSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSZSSSS#SSSSZSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSZSSSS#PPSSPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPSSPP#GPSSPGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGPSSPG";
function pollThickFromServer(){
    let repeatAfterDelay = function(){        
        if(!POLL){
            return;
        }
        var delay = document.getElementById("stepdelay").value;
        setTimeout(pollThickFromServer,delay);
    }
    $.ajax({
        url: 'wait_for_thick',
        type: 'GET',
        success: function(data){
            //console.log("Got data from server: \n"+JSON.stringify(data, null, 2));
            if(data.end){
                refreshOldGames();
                console.log("Game finished!");
                stopGame();
                return;
            }
            // console.log("---------LÉPÉS "+data.thick.request_id.tick+" -----------");
            // console.log(data.thick.cars[0]);
            // console.log(data.sent);
            // console.log(data.info);
            repeatAfterDelay();
            drawMap(data.thick, data.sent.command, data.info.route);
            window.steps.push(data);

            /**
             * Test car collision logic
             */
            if (GAME.myCar && data.thick){
                var danger = CollisionDetector.isDanger(GAME.myCar, data.thick);
                    if(danger){
                        console.error("Danger:\n");
                        console.error(danger);
                        // console.log("Tickdta: \n");
                        // console.log(data.thick);
                        // stopGame();
                        // alert("isDangerV3");
                    }
            }
            if(GAME.myCar && data.thick){
                if(!GAME.lastLife){
                    GAME.lastLife = GAME.myCar.life;
                }else if(GAME.myCar.life != GAME.lastLife){
                        console.error("Life point was lost !!!");
                        stopGame();
                        alert("Life point was lost !!!");
                }
            }
            
        },
        error: function(data) {            
            console.error("Game finished with error!",data);            
            refreshOldGames();
            stopGame();
        }
    });
}

function stopGame(){
    POLL = false;
    window.steps = [];
    document.getElementById("startorstop").innerHTML = "START";
}

function startOrStop(){    
    
    if(!POLL){
        document.getElementById("startorstop").innerHTML = "STOP";
        POLL = true;
        window.steps = [];
        pollThickFromServer();        
    }else{
       stopGame(); 
    }  
    $.ajax({
        url: 'startorstop',
        type: 'POST',
        data:JSON.stringify({
            gameMatrix:GAME.gameMatrix
        }),
        contentType: "application/json; charset=utf-8",
        dataType: "json",
        success: function(data){            
            console.log(data)
        },
        error: function(data) {
            
        }
    });
}

var mapRows = mapstr.split("#");
GAME.width = mapRows[0].length;
GAME.height = mapRows.length;
for(var i = 0; i < mapRows.length; i++){
    let row = mapRows[i];
    GAME.gameMatrix[i] = [];
    for(var j = 0; j < row.length; j++){        
        GAME.gameMatrix[i].push(row[j]);
    }
}

function drawMap(thickData, answerCommand, route){
    GAME.canvasContext.fillStyle = "#ffffff";
    GAME.canvasContext.fillRect(0,0,GAME.gameMatrix[0].length,GAME.gameMatrix.length);
    if (thickData){
        var myCarId = thickData.request_id.car_id;
        GAME.myCar = thickData.cars.find(function(c) {return c.id === myCarId});
        document.getElementById("thicknum").innerHTML = thickData.request_id.tick;
        document.getElementById("step").innerHTML = answerCommand;
        document.getElementById("transportednum").innerHTML = GAME.myCar.transported;
        document.getElementById("life").innerHTML = GAME.myCar.life;
        document.getElementById("gameid").innerHTML = thickData.request_id.game_id;
    }
    // Ha szallitok utast
    if(GAME.myCar && GAME.myCar.passenger_id && thickData.passengers){
        GAME.myPassenger = thickData.passengers.find(function(o){ return o.id == GAME.myCar.passenger_id });
    }else{
        GAME.myPassenger = undefined;
    }
    for(var rowIdx = 0; rowIdx < GAME.gameMatrix.length; rowIdx++){
        for(var colIdx = 0; colIdx < GAME.gameMatrix[rowIdx].length; colIdx++){
            GAME.canvasContext.fillStyle = getColorByField(GAME.gameMatrix[rowIdx][colIdx]);
            GAME.canvasContext.fillRect(colIdx*GAME.mapRatio,rowIdx*GAME.mapRatio,GAME.mapRatio,GAME.mapRatio);
        }
    }
    if(GAME.myCar){
        GAME.canvasContext.fillStyle = "#2196F388";
        GAME.canvasContext.fillRect(GAME.myCar.pos.x*GAME.mapRatio,GAME.myCar.pos.y*GAME.mapRatio,GAME.mapRatio,GAME.mapRatio);

        for(let point of CollisionDetector.mapCoordsSeenByCar(GAME.myCar)){
            GAME.canvasContext.fillStyle = "#FF000088";
            GAME.canvasContext.fillRect(point.x*GAME.mapRatio, point.y*GAME.mapRatio,GAME.mapRatio,GAME.mapRatio);
        }
        // Draw an arrow
        GAME.canvasContext.fillStyle = "#FFFF00";
        fromx = GAME.myCar.pos.x*GAME.mapRatio;
        fromy = GAME.myCar.pos.y*GAME.mapRatio;
        tox = GAME.mapRatio*normals[GAME.myCar.direction].x + fromx;
        toy = GAME.mapRatio*normals[GAME.myCar.direction].y + fromy;
        canvas_arrow(GAME.canvasContext, fromx + 0.5*GAME.mapRatio, fromy + 0.5*GAME.mapRatio, tox + 0.5*GAME.mapRatio, toy + 0.5*GAME.mapRatio, 5);

        // Draw passenger destinations
        if(GAME.myPassenger){
            GAME.canvasContext.fillStyle = "#0000FF";
            GAME.canvasContext.fillRect(GAME.myPassenger.dest_pos.x*GAME.mapRatio, GAME.myPassenger.dest_pos.y*GAME.mapRatio,GAME.mapRatio,GAME.mapRatio);
        }
    }
    if(thickData){
        thickData.pedestrians.forEach(pedestrian => {
            GAME.canvasContext.fillStyle = "#FFFF00";
            GAME.canvasContext.fillRect(pedestrian.pos.x*GAME.mapRatio,pedestrian.pos.y*GAME.mapRatio,GAME.mapRatio,GAME.mapRatio);
        });
        thickData.passengers.forEach(passanger => {
            GAME.canvasContext.fillStyle = "#FFA000";
            GAME.canvasContext.fillRect(passanger.pos.x*GAME.mapRatio,passanger.pos.y*GAME.mapRatio,GAME.mapRatio,GAME.mapRatio);
        });
        thickData.cars.forEach(car => {
            if(GAME.myCar && car.id != GAME.myCar.id){
                for(let point of CollisionDetector.mapCoordsSeenByCar(car)){
                    GAME.canvasContext.fillStyle = "#FFFF0077";
                    GAME.canvasContext.fillRect(point.x*GAME.mapRatio, point.y*GAME.mapRatio,GAME.mapRatio,GAME.mapRatio);
                }
                
                // Draw an arrow
                GAME.canvasContext.fillStyle = "#FF00AA";
                fromx = car.pos.x*GAME.mapRatio;
                fromy = car.pos.y*GAME.mapRatio;
                tox = GAME.mapRatio*normals[car.direction].x + fromx;
                toy = GAME.mapRatio*normals[car.direction].y + fromy;
                canvas_arrow(GAME.canvasContext, fromx + 0.5*GAME.mapRatio, fromy + 0.5*GAME.mapRatio, tox + 0.5*GAME.mapRatio, toy + 0.5*GAME.mapRatio, 5);
                
                GAME.canvasContext.fillStyle = "#2196F388";
                GAME.canvasContext.fillRect(car.pos.x*GAME.mapRatio,car.pos.y*GAME.mapRatio,GAME.mapRatio,GAME.mapRatio);
            }
        });
    }
    if(route && route.length >=2){
        GAME.canvasContext.lineWidth = 10;
        GAME.canvasContext.strokeStyle = "#0000FF88";
        b  = GAME.mapRatio/2;
        GAME.canvasContext.beginPath();
        GAME.canvasContext.moveTo(GAME.myCar.pos.x*GAME.mapRatio + b, GAME.myCar.pos.y*GAME.mapRatio + b);
        GAME.canvasContext.lineTo(route[0].x*GAME.mapRatio + b, route[0].y*GAME.mapRatio + b);
        GAME.canvasContext.stroke();
        for(var k=0; k<route.length-1; k++){
            b  = GAME.mapRatio/2;
            GAME.canvasContext.beginPath();
            GAME.canvasContext.moveTo(route[k].x*GAME.mapRatio + b, route[k].y*GAME.mapRatio + b);
            GAME.canvasContext.lineTo(route[k+1].x*GAME.mapRatio + b, route[k+1].y*GAME.mapRatio + b);
            GAME.canvasContext.stroke();
        }
    }
}

function getColorByField(field){
    switch(field){
        case ASZFALT:
            return "#868686";
        case ZEBRA:
            return "#FFFFFF";
        case JÁRDA:
            return "#cfcfcf";
        case FŰ:
            return "#8fbf60";
        case ÉPÜLET:
            return "#b65265";
        case FA:
            return "#1c6718";
    }
}

function mapSizeChanged(value){
    GAME.mapRatio = value;
    var canvas = document.getElementById("canvas"); 
    canvas.width = GAME.gameMatrix[0].length*GAME.mapRatio;
    canvas.height = GAME.gameMatrix.length*GAME.mapRatio;
    canvas.addEventListener("click",function(event){        
            var rect = canvas.getBoundingClientRect();
            var x = event.clientX - rect.left;
            var y = event.clientY - rect.top;
            alert("x: " + Math.floor(x/GAME.mapRatio) + " y: " + Math.floor(y/GAME.mapRatio));        
    })
    GAME.canvasContext = canvas.getContext("2d");
    drawMap();
}



function findAllLinearStreets(from, across){
    if(!isAszfalt(from)){
        return;
    } 
    if(!across){
        //first find
        findAllLinearStreets(from,{i:from.i+1,j:from.j});
        findAllLinearStreets(from,{i:from.i-1,j:from.j});
        findAllLinearStreets(from,{i:from.i,j:from.j+1});
        findAllLinearStreets(from,{i:from.i,j:from.j-1});
        return;
    }
    if(across.i < 0 || across.j < 0 || across.i >= GAME.width || across.j >= GAME.height){
        //Not in map
        return;
    }
    if(isAszfalt(across)){
        var distance = Math.abs(from.i-across.i) + Math.abs(from.j-across.j);
        GAME.graph.addLink(from.i+":"+from.j,across.i+":"+across.j,{weight:calcWeight(from,across,distance)});
        findAllLinearStreets(from,{
            i:across.i + (across.i-from.i)/distance,
            j:across.j + (across.j-from.j)/distance
        });
    }
}

function isAszfalt(point){
    return GAME.gameMatrix[point.i][point.j] == ASZFALT || GAME.gameMatrix[point.i][point.j] == ZEBRA
}

function calcWeight(from,dest,distance){
    if(distance > 5){
        return distance;//5 + Math.floor((distance-5) / 2)
    }else{
        return distance;
    }
}




for(var i = 0; i < GAME.gameMatrix.length; i++){
    for(var j = 0; j < GAME.gameMatrix[i].length; j++){
        findAllLinearStreets({i:i,j:j});
    }
}

GAME.pathFinder = ngraphPath.aStar(GAME.graph, {    
    distance(fromNode, toNode, link) {
      return link.data.weight;
    }
});

$( document ).ready(function() {
    refreshOldGames();    
    mapSizeChanged(10);
    drawMap();
});

function refreshOldGames(){
    document.getElementById("oldlistcontainer").innerHTML = '<table id="oldlist" style="width: 100%;"><tr><th>GameId</th><th>transported</th><th></th></tr></table>';
    $.ajax({
        url: 'loadGames',
        type: 'GET',
        dataType: "json",
        success: function(data){                        
            data.forEach(game => {               
                createGameDiv(game);
            });
        },
        error: function(data) {
            
        }
    });
}

function createGameDiv(game){
    var container = document.createElement("tr");
    var id = document.createElement("td");
    id.innerHTML = game[0].thick.request_id.game_id;
    container.appendChild(id);    
    var points = document.createElement("td");
    var mycar = game[game.length-1].thick.cars.find(function(c) {return c.id === game[0].thick.request_id.car_id});
    points.innerHTML = mycar.transported;
    container.appendChild(points);
    
    var playtd = document.createElement("td");
    var load = document.createElement("button");
    load.innerHTML="Elindít";
    playtd.appendChild(load);
    load.addEventListener("click",function(){
        if(game.running){
            game.running = false;
        }else{
            game.running = true;
            replayNext(game);
        }        
    });
    container.appendChild(playtd);

    document.getElementById("oldlist").appendChild(container);
}

function replayNext(game){
    let datas = game.shift();
    drawMap(datas.thick,datas.step.command);
    if(game.length > 0){
        setTimeout(function(){
            if(!game.running){
                return;
            }
            replayNext(game);
        },document.getElementById("stepdelay").value);
    }else{
        game.running = false;
    }    
}

function canvas_arrow(context, fromx, fromy, tox, toy, r){
    var x_center = tox;
    var y_center = toy;

    var angle;
    var x;
    var y;

    context.beginPath();

    angle = Math.atan2(toy-fromy,tox-fromx)
    x = r*Math.cos(angle) + x_center;
    y = r*Math.sin(angle) + y_center;

    context.moveTo(x, y);

    angle += (1/3)*(2*Math.PI)
    x = r*Math.cos(angle) + x_center;
    y = r*Math.sin(angle) + y_center;

    context.lineTo(x, y);

    angle += (1/3)*(2*Math.PI)
    x = r*Math.cos(angle) + x_center;
    y = r*Math.sin(angle) + y_center;

    context.lineTo(x, y);

    context.closePath();

    context.fill();
}