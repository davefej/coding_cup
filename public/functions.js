window.GAME = {
    gameMatrix:[],
    width:0,
    height:0,
    mapRatio:10,
    canvasContext:undefined,
    pathFinder:undefined,
    graph:createGraph(),
    myCar: undefined,
    myPassenger: undefined
};

var POLL = false;
const ASZFALT = "S", ZEBRA = "Z", JÁRDA = "P",FŰ = "G", ÉPÜLET = "B", FA = "T";
const mapstr = "GPSSPGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGPSSPG#PPSSPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPSSPP#SSSSSSSSSSSSSSSSSSSSSSSSSSSSZSSZSSSSSSSSSSSSSSSSSSSSSSSSSSSS#SSSSSSSSSSSSSSSSSSSSSSSSSSSSZSSZSSSSSSSSSSSSSSSSSSSSSSSSSSSS#GPSSPPPZZPPPPPPPPPPPPPPPPPPPPSSPPPPPPPPPPPPPPPPPPPPZZPPPSSPP#GPSSPGPSSPGBBGBBGGBBGGBBGBBGPSSPGBBGBBGGBBGGBBGBBGPSSPBPSSPG#GPSSPBPSSPPPPPPPPPPPPPPPPPPPPSSPPPPPPPPPPPPPPPPPPPPSSPBPSSPG#GPSSPBPSSSSSSSSZSSZSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSPGPSSPG#GPSSPBPSSSSSSSSZSSZSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSPBPSSPG#GPSSPBPSSPPPPPPPSSPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPSSPBPSSPG#GPSSPGPSSSPPGBBPSSPGGGGGBBBBBGPPPPPPPPGGBBBBBBGBBPSSSPGPSSPG#GPSSPBPSSSSPPGBPSSPGTGPPPPPPPPPSSSSSSPPPBBBBBBGBBPSGSPBPSSPG#GPSSPBPPSSSSPPGPSSPGGGPSSSSSSSSSSSSSSSSPPPGGGPPPPPSGSPBPSSPG#GPSSPGGPPSSSSPPPSSPPBBPSSSSSSSSSSPPSSSSSSPPPGPSSSSSGSPGPSSPG#GPSSPGGGPPSSSSPSSSSPPPPSSPSSPPSSPPPPPSSSSSSPPPSSSSSSSPGPSSPG#GPSSPGGGGPPSSSSSBBSSSSSSSSSSPPSSSSSSPPPSSSSSSZSSPPPPPPGPSSPG#GPSSPGGGGGPPSSSSBBSSSSSSSSSSPPSPPPPSSSPPPSSSSZSSPPSSPGGPSSPG#GPSSPGGGGGGPPPPSSSSPPPPPPPPPPPSPPSSSSSSPPPPPPPSSPPSSPTTPSSPG#GPSSPGGGGGGGGGPPSSPPSSSSSSSSGPSSSSPPSSSSPPGTGPSSSSSSPTGPSSPG#GPSSPGGGGGGBBBGPSSSSSSSSSSSSSPPPPPPPPSSSSPPGPPSSSSSSPTTPSSPG#GPSSPGGGGGGBBBGPSSSSSSPPPPSSSSSSSSSSPPSSSSPPPSSSPPPPPTTPSSPG#GPSSPGGGGGGBBBGPSSPPPPPGGPPSSSSSSSSSSPPSSSSPSSSSPBBBBTGPSSPG#GPSSPGPPPPPPPPPPSSPGGGGGGGPPPPPPPPSSSSPPSSSSSSSPPBBBBBGPSSPG#GPSSPGPSSSSSSSSSSSPGGGGGGGGGGGBBGPPSSSSPPSSSSSPPGGGGGGGPSSPG#GPSSPGPSSSSSSSSSSSPGGGGBGGGGGGBBGGPPSSSSPPPPSSSPPPPPPGTPSSPG#GPSSPGPSSPPPPPPPSSPGGGGGGGGGGGGGGGGPPSSSSSSPSSSSSSSSPGTPSSPG#GPSSPGPSSPBGBBBPSSPGGGGGGGGGGPPPPGGGPPSSSSSPPSSSSSSSPGTPSSPG#GPSSPGPSSPBGBBBPSSPGGGGGGGGGPPSSPPGGGPPPPPPPPPPPPPZZPPGPSSPG#GPZZPPPZZPPPPPPPSSPPPPPPPPPPPSSSSPPPPPPPPPPPPPPPPSSSSPPPZZPG#GPSSSSSSSSSSSSSSSSSSSSSSSSSSSSBBSSSSSSSSSSSSSSSSSSBBSSSSSSPG#GPSSSSSSSSSSSSSSSSSSSSSSSSSSSSBBSSSSSSSSSSSSSSSSSSBBSSSSSSPG#GPZZPPPPPPPPPPPPPPPPSSPPPPPPPSSSSPPPPPPPSSPPPPPPPSSSSPPPZZPG#GPSSPGPSSSSPPBBBBPPSSSPGGPPPPPSSPPPPPGGPSSSPPGBBPPSSPPGPSSPG#GPSSPBPSSSSSPBBBBPSSSSPBBPSSSSSSSSSSPGGPSSSSPGBBGPSSPGBPSSPG#GPSSPBPPPSSSPGGGGPSSSPPGGPSSSSSSSSSSPGGPPSSSPGGGGPSSPGBPSSPG#GPSSPGGGPPSSPGGGGPSSPPGGGPSSPPPPPPSSPGGGPPSSPGGGGPSSPGBPSSPG#GPSSPGGBBPSSPGGGGPSSPGGGBPSSPGGGGPSSPGGGGPSSPGGGGPSSPGBPSSPG#GPSSPGGBBPSSPGGGGPSSPGBBBPSSPGGGGPSSPGGGGPSSPGGGGPSSPGBPSSPG#GPSSPGPPPPSSPPPPPPZZPPPPPPZZPPPPPPSSPPPPPPZZPPPPPPZZPPGPSSPG#GPSSPBPSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSZSSZSSSSSSSSPBPSSPG#GPSSPBPSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSZSSZSSSSSSSSPBPSSPG#GPSSPGPSSPPPPPSSPPPPPPPPPPPPZZPPPPPZZPPPPPSSPPPPPSSPPPBPSSPG#GPSSPBPSSPGGGPSSPGGGGGGGBBBPSSPGGGPSSPBBGPSSPGBBPSSPBGBPSSPG#GPSSPBPSSPGGGPSSPGGGGGGGBBBPSSPGGGPSSPBBGPSSPGBBPSSPBGBPSSPG#GPSSPGPSSPPPPPZZPPPPPPPPPPPPSSPPPPPSSPPPPPSSPPPPPSSPPGGPSSPG#GPSSPGPSSSSSSZSSZSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSPGBPSSPG#GPSSPGPSSSSSSZSSZSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSPGBPSSPG#GPSSPGPPSSPPPPZZPPPPSSPPPPZZPPPPSSPPPPPPPPPPSSPPPPZZPGBPSSPG#GPSSPGGPSSPBBPSSPBBPSSPGBPSSPBGPSSPGGGGGGGGPSSPGGPSSPGBPSSPG#GPSSPGGPSSPBBPSSPBBPSSPBBPSSPBGPSSPGGGGGGGGPSSPGGPSSPGBPSSPG#GPSSPGGPSSPPPPSSPPPPZZPPPPSSPPPPZZPPPPPPPPPPZZPPPPSSPGGPSSPG#GPSSPGGPSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSPPPGGPSSPG#GPSSPGGPSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSPGGGGPSSPG#GPSSPGGPPPPPPPPPPPPPPPPPPPPPPSSPPPPPPPPPPPPPPPPPPPPGGGGPSSPG#GPSSPGGGGGGGGGGGGGBBBBGGBBBBPSSPBBBBGGBBBBGGGGGGGGGGGGGPSSPG#PPSSPPPPPPPPPPPPPPPPPPPPPPPPPSSPPPPPPPPPPPPPPPPPPPPPPPPPSSPP#SSSSZSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSZSSSS#SSSSZSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSZSSSS#PPSSPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPSSPP#GPSSPGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGPSSPG";
function pollThickFromServer(){
    let repeatAfterDelay = function(){        
        if(!POLL){
            return;
        }
        setTimeout(pollThickFromServer,100);
    }
    $.ajax({
        url: 'wait_for_thick',
        type: 'GET',
        success: function(data){
            console.log("---------LÉPÉS "+data.thick.request_id.tick+" -----------");
            console.log(data.thick.cars[0]);
            console.log(data.sent);
            console.log(data.info);
            repeatAfterDelay();
            drawMap(data.thick);
            window.steps.push(data);
        },
        error: function(data) {
            console.error(data)
            repeatAfterDelay();
        }
    });
}

function startOrStop(){    
    POLL = !POLL;
    if(POLL){
        window.steps = [];
        pollThickFromServer();
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



function drawMap(thickData){
    GAME.canvasContext.fillStyle = "#ffffff";
    GAME.canvasContext.fillRect(0,0,GAME.gameMatrix[0].length,GAME.gameMatrix.length);
    if (thickData){
        var myCarId = thickData.request_id.car_id;
        GAME.myCar = thickData.cars.find(function(c) {return c.id === myCarId});
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
            if(GAME.myCar){
                if (isSeen({x: colIdx, y: rowIdx}, GAME.myCar)) {
                    GAME.canvasContext.fillStyle = "#FF000088";
                    GAME.canvasContext.fillRect(colIdx*GAME.mapRatio,rowIdx*GAME.mapRatio,GAME.mapRatio,GAME.mapRatio);
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
                    GAME.canvasContext.fillRect(GAME.myPassenger.dest_pos.x*GAME.mapRatio,
                        GAME.myPassenger.dest_pos.y*GAME.mapRatio,GAME.mapRatio,GAME.mapRatio);
                }
            }
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
            GAME.canvasContext.fillStyle = "#2196F388";
            GAME.canvasContext.fillRect(car.pos.x*GAME.mapRatio,car.pos.y*GAME.mapRatio,GAME.mapRatio,GAME.mapRatio);
        });
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
        return 5 + Math.floor((distance-5) / 3)
    }else{
        return distance;
    }
}

/**
 * Area seen by the car 
 */
var viewArea = [
    "         ",
    "   XXX   ",
    "   XXX   ",
    "   XXX   ",
    "   XXX   ",
    "  XXXXX  ",
    " XXXXXXX ",
    " XXXXXXX ",
    " XXXCXXX ",
    "  XXXXX  ",
    "   XXX   ",
    "    X    ",
    "         "
];

const viewAreaCoords = (function() {
    var carCoords = []
    var seenCoords = []
    for (var y=0; y < viewArea.length; ++y){
        var line = viewArea[y];
        for(var x=0; x < line.length; ++x){
            if (viewArea[y][x] == 'C'){
                carCoords = {x: x, y:y}
            }
            if (viewArea[y][x] ==  'X'){
                seenCoords.push({x: x, y: y})
            }
        }
    }
    var relativeSeenCoords = []
    for(var k in seenCoords){
        relativeSeenCoords.push({x: seenCoords[k].x-carCoords.x, y: seenCoords[k].y-carCoords.y})
    }
    return relativeSeenCoords;
})();

function rmatrix(phi){
    return [[Math.cos(phi), -Math.sin(phi)], [Math.sin(phi), Math.cos(phi)]]
}

function dot(mat22, vec2){
    return {x: Math.round(mat22[0][0]*vec2.x + mat22[0][1]*vec2.y), y: Math.round(mat22[1][0]*vec2.x + mat22[1][1]*vec2.y)}
}

function transformedSeenCoords(dir) {
    if (dir === '^'){
        return viewAreaCoords;
    } else if (dir === 'v') {
        var rotated = [];
        var R = rmatrix(Math.PI);
        for(var k in viewAreaCoords){
            rotated.push(dot(R, viewAreaCoords[k]));
        }
        return rotated;
    } else if (dir === '<'){
        var rotated = [];
        var R = rmatrix(-Math.PI/2.0);
        for(var k in viewAreaCoords){
            rotated.push(dot(R, viewAreaCoords[k]));
        }
        return rotated;
    } else if (dir === '>'){
        var rotated = [];
        var R = rmatrix(Math.PI/2.0);
        for(var k in viewAreaCoords){
            rotated.push(dot(R, viewAreaCoords[k]));
        }
        return rotated;
    } else {
        throw Error("Invalid car direction: "+dir);
    }
};

function mapCoordsSeenByCar(car) {
    var seenRel = transformedSeenCoords(car.direction);
    var rv = [];
    seenRel.forEach(c => {
        rv.push({x: c.x + car.pos.x, y: c.y + car.pos.y});
    });
    return rv;
}

function isSeen(point, car){
    var pointsSeen = mapCoordsSeenByCar(car);
    for(let p of pointsSeen){
        if(p.x === point.x && p.y === point.y) {
            return true;
        }
    }
    return false;
}

var normals = {
    '^': {x: 0, y: -1},
    '>': {x: 1, y: 0},
    '<': {x: -1, y: 0},
    'v': {x: 0, y: 1}
};
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

function simulateCarPos(carCoords, carDir, GAME){
    
    for(var rowIdx = 0; rowIdx < GAME.gameMatrix.length; rowIdx++){
        for(var colIdx = 0; colIdx < GAME.gameMatrix[rowIdx].length; colIdx++){
            if (isSeen({x: colIdx, y: rowIdx}, {pos: carCoords, direction: carDir})){
                GAME.canvasContext.fillStyle = "#FF0000AA";
                GAME.canvasContext.fillRect(colIdx*GAME.mapRatio,rowIdx*GAME.mapRatio,GAME.mapRatio,GAME.mapRatio);
            }
            if (colIdx === carCoords.x && rowIdx === carCoords.y){
                GAME.canvasContext.fillStyle = "#0000FF99";
                GAME.canvasContext.fillRect(colIdx*GAME.mapRatio,rowIdx*GAME.mapRatio,GAME.mapRatio,GAME.mapRatio);
                
                // Draw an arrow
                GAME.canvasContext.fillStyle = "#FFFF00";
                fromx = colIdx*GAME.mapRatio;
                fromy = rowIdx*GAME.mapRatio;
                tox = GAME.mapRatio*normals[carDir].x + fromx;
                toy = GAME.mapRatio*normals[carDir].y + fromy;
                canvas_arrow(GAME.canvasContext, fromx + 0.5*GAME.mapRatio, fromy + 0.5*GAME.mapRatio, tox + 0.5*GAME.mapRatio, toy + 0.5*GAME.mapRatio, 5);
            }
        }
    }
}

function canCollide(pedestrian, car){
    return isSeen(pedestrian.pos, car);
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
    
    
    mapSizeChanged(10);    
    drawMap();
});

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
        //TODO
    });
    container.appendChild(playtd);

    document.getElementById("oldlist").appendChild(container);
}

