window.GAME = {
    gameMatrix:[],
    width:0,
    height:0,
    mapRatio:10,
    canvasContext:undefined,
    pathFinder:undefined,
    graph:createGraph()
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
            console.log(data)
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

$( document ).ready(function() {
    mapSizeChanged(10);    
    drawMap();
});

function drawMap(thickData){
    GAME.canvasContext.fillStyle = "#ffffff";
    GAME.canvasContext.fillRect(0,0,GAME.gameMatrix[0].length,GAME.gameMatrix.length);
    for(var rowIdx = 0; rowIdx < GAME.gameMatrix.length; rowIdx++){
        for(var colIdx = 0; colIdx < GAME.gameMatrix[rowIdx].length; colIdx++){
            GAME.canvasContext.fillStyle = getColorByField(GAME.gameMatrix[rowIdx][colIdx]);
            if(thickData){
                if (isSeen({i: rowIdx, j: colIdx}, thickData)) {
                    GAME.canvasContext.fillStyle = "#FF0000";
                }
            }
            GAME.canvasContext.fillRect(colIdx*GAME.mapRatio,rowIdx*GAME.mapRatio,GAME.mapRatio,GAME.mapRatio);
            /*if(GAME.graph.getLinks(rowIdx+":"+colIdx)){
                GAME.canvasContext.fillStyle = "#ff333399";
                GAME.canvasContext.fillRect(colIdx*GAME.mapRatio,rowIdx*GAME.mapRatio,GAME.mapRatio,GAME.mapRatio);
            }*/
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
            GAME.canvasContext.fillStyle = "#2196F3";
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

const fields = [
    "         ",
    "   XXX   ",
    "   XXX   ",
    "   XXX   ",
    "   XXXX  ",
    "  XXXXX  ",
    " XXXXXXX ",
    " XXXXXXX ",
    " XXXCXXX ",
    "  XXXXX  ",
    "   XXX   ",
    "    X    ",
    "         "
];

function relativeCoordsFromFields(){
    carCoords = []
    seenCoords = []
    for (var y=0; y < fields.length; ++y){
        var line = fields[y];
        for(var x=0; x < line.length; ++x){
            if (fields[y][x] == 'C'){
                carCoords = [x, y]
            }
            if (fields[y][x] ==  'X'){
                seenCoords.push([x, y])
            }
        }
    }
    relativeSeenCoords = []
    for(var k in seenCoords){
        relativeSeenCoords.push([seenCoords[k][0]-carCoords[0], seenCoords[k][1]-carCoords[1]])
    }
    return relativeSeenCoords;
}

function rmatrix(phi){
    return [Math.cos(phi), -Math.sin(phi)], [Math.sin(phi), Math.cos(phi)]
}
function dot(mat22, vec2){
    return [[mat22[0][0]*vec2[0] + mat22[0][1]*vec2[1]], [mat22[1][0]*vec2[0] + mat22[1][1]*vec2[1]]]
}

function transformedSeenCoords(dir) {
    
    originalCoords =  relativeCoordsFromFields();
    switch(dir){
        case '^': {
            return originalCoords;
        }
        case '<': {
            rotated = []
            R = rmatrix(Math.PI/2.0)
            for(var k in originalCoords){
                rotated.push(dot(R, originalCoords[k]))
            }
            return rotated
        }
        case '>': {
            rotated = []
            R = rmatrix(-Math.PI/2.0)
            for(var k in originalCoords){
                rotated.push(dot(R, originalCoords[k]))
            }
            return rotated
        }
        case 'v': {
            rotated = []
            R = rmatrix(Math.PI)
            for(var k in originalCoords){
                rotated.push(dot(R, originalCoords[k]))
            }
            return rotated
        }
    }
};

function isSeen(point, thickData){
    myCar=thickData.cars.find(function(o){return o.id==thickData.request_id.car_id});
    myCarPos=myCar.pos;
    myCarDir=myCar.direction;
    seenFieldsRelative = transformedSeenCoords(myCarDir);
    for(var k in seenFieldsRelative){
        if (point.j == (seenCoords[k][0] + myCarPos.x) && point.i == (seenFieldsRelative[k][1] + myCar.pos.y)){
            return true
        }
    }
    return false
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
