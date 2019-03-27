const ASZFALT = "S", ZEBRA = "Z", JÁRDA = "P",FŰ = "G", ÉPÜLET = "B", FA = "T";
const LEFT = "<", RIGHT = ">", UP = "^", DOWN = "v";
const NO_OP = "NO_OP", ACCELERATION = "ACCELERATION", DECELERATION = "DECELERATION",
CAR_INDEX_LEFT = "CAR_INDEX_LEFT", CAR_INDEX_RIGHT = "CAR_INDEX_RIGHT", CLEAR = "CLEAR",
FULL_THROTTLE = "FULL_THROTTLE",EMERGENCY_BRAKE = "EMERGENCY_BRAKE", GO_LEFT = "GO_LEFT", GO_RIGHT = "GO_RIGHT";
let ngraphPath = require('ngraph.path');
let createGraph = require('ngraph.graph');


var currentPassenger, currentPath, currentNode, car;


module.exports  = {
    calculateNextStep(thickData){
        car = findCar(thickData);
        let carPos = car.pos;
        if(carPos.x == currentPassenger.pos.x || carPos.y == currentPassenger.pos.y){
            currentPassenger = null;
        }
        if(!currentPassanger){
            let ret = findClosestPassenger(thickData);
            currentPassenger = ret.passenger;
            currentPath = ret.shortestNodeList;
        }
        if(currentPath[0].x == carPos.x && currentPath.y == carPos.y){
            //node Reached
            currentPath.shift();
        }
        return {
            "response_id": {
            "game_id": thickData.request_id.game_id,
            "tick":thickData.request_id.tick,
            "car_id": thickData.request_id.car_id
            },
            command:calculateCommand(currentPath[0],currentPath[1])
        };
    },
    setMap(map){
        this.map = map;
    },
    firstMessage(){
        return {
            token:"1iVXOVZK7ldH5Kr6qYCEkZE6xpR0SXZJkyfQayrKfJ2e9S8xdeTjsV9oohjePSsUXFOcDnevsu918"
        };
    }
};


function calculateCommand(toNode,nextNode){
    if(car.speed == 0){
        //start or stops at passanger
        if(car.direction != calculateDirection(car.pos,toNode)){
            return turnCommandFromDirections(calculateDirection(car.pos,toNode));
        }else{
            return ACCELERATION;
        }        
    }else{
        var direction = calculateDirection(car.pos,toNode);
        if(direction == car.direction){
            if(calcPointsDistance(car.pos,toNode) == 1){
                if(nextNode){
                    //rotation
                    return turnCommandFromDirections(calculateDirection(toNode,nextNode));
                }else{
                    //final destination stop
                    return DECELERATION;
                }            
            }else{
                //go forward
                if(car.speed == 0){
                    return ACCELERATION;
                }else{
                    return NO_OP;
                }
                
            }
        }else{
            
        }
    }
}

function turnCommandFromDirections(lastDirection,nextDirection){
    if(lastDirection == UP && nextDirection == LEFT){
        return CAR_INDEX_LEFT;
    }else if(lastDirection == UP && nextDirection == RIGHT){
        return CAR_INDEX_RIGHT;
    }else if(lastDirection == DOWN && nextDirection == LEFT){
        return CAR_INDEX_RIGHT;
    }else if(lastDirection == DOWN && nextDirection == LEFT){
        return CAR_INDEX_LEFT;
    }else if(lastDirection == LEFT && nextDirection == UP){
        return CAR_INDEX_RIGHT;
    }else if(lastDirection == LEFT && nextDirection == DOWN){
        return CAR_INDEX_LEFT;
    }else if(lastDirection == RIGHT && nextDirection == UP){
        return CAR_INDEX_LEFT;
    }else if(lastDirection == RIGHT && nextDirection == DOWN){
        return CAR_INDEX_RIGHT;
    }
    
    
}

function calculateDirection(from,to){
    if(from.x > to.x){
        return LEFT;
    }else if(from.x < to.x){
        return RIGHT;
    }else if(from.y < to.y){
        return DOWN;
    }else if(from.y > to.y){
        return UP;
    }else{
        return null;
    }
}

function findClosestPassenger(thickData){
    let carPos,shortestDistance,shortestNodeList,passenger;
    carPos = findCarPos(thickData);
    for(var i = 0; i < thickData.passengers.length; i++){        
        var nodeList = GAME.pathFinder.find(graphPosFromXY(carPos),graphPosFromXY(thickData.passengers[i].pos));
        var currentDistance = calculateDistanceFromNodeList();
        if(!shortestDistance || shortestDistance > currentDistance){
            shortestDistance = currentDistance;
            passenger = thickData.passengers[i];
            shortestNodeList = nodeList;
        }
    }
    return {
        shortestDistance:shortestDistance,
        shortestNodeList:formatNodeList(shortestNodeList),
        passenger:passenger
    };
}

function findCarPos(thickData){
    return findCar(thickData).pos;
}

function findCar(thickData){
    for(var i = 0; i < thickData.cars.length; i++){
        if(thickData.request_id.car_id == thickData.cars[i].id){
            return thickData.cars[i];
        }
    }
}

function calculateDistanceFromNodeList(nodes){
    var sum = 0;
    for(var i = nodes.length-1; i > 0; i--){
        var akt = nodes[i].id.split(":");
        var next = nodes[i-1].id.split(":");
        sum += (Math.abs(akt[0]-next[0]) + Math.abs(akt[1]-next[1]));
    }
    return sum;
}

function graphPosFromXY(pos){
    //Mátrix felépítés i az y tengely j az x tengely
    return pos.y + ":"+ pos.x;
}

function formatNodeList(nodes){
    var ret = [];
    for(var i = nodes.length; i >= 0; i--){
        var positions = nodes[i].id.split(":");
        ret.push({
            x:positions[1],
            y:positions[0]
        });
    }
    return ret;
}

let GAME = {
    gameMatrix: [],
    graph:createGraph()
};

let mapstr = "GPSSPGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGPSSPG#PPSSPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPSSPP#SSSSSSSSSSSSSSSSSSSSSSSSSSSSZSSZSSSSSSSSSSSSSSSSSSSSSSSSSSSS#SSSSSSSSSSSSSSSSSSSSSSSSSSSSZSSZSSSSSSSSSSSSSSSSSSSSSSSSSSSS#GPSSPPPZZPPPPPPPPPPPPPPPPPPPPSSPPPPPPPPPPPPPPPPPPPPZZPPPSSPP#GPSSPGPSSPGBBGBBGGBBGGBBGBBGPSSPGBBGBBGGBBGGBBGBBGPSSPBPSSPG#GPSSPBPSSPPPPPPPPPPPPPPPPPPPPSSPPPPPPPPPPPPPPPPPPPPSSPBPSSPG#GPSSPBPSSSSSSSSZSSZSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSPGPSSPG#GPSSPBPSSSSSSSSZSSZSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSPBPSSPG#GPSSPBPSSPPPPPPPSSPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPSSPBPSSPG#GPSSPGPSSSPPGBBPSSPGGGGGBBBBBGPPPPPPPPGGBBBBBBGBBPSSSPGPSSPG#GPSSPBPSSSSPPGBPSSPGTGPPPPPPPPPSSSSSSPPPBBBBBBGBBPSGSPBPSSPG#GPSSPBPPSSSSPPGPSSPGGGPSSSSSSSSSSSSSSSSPPPGGGPPPPPSGSPBPSSPG#GPSSPGGPPSSSSPPPSSPPBBPSSSSSSSSSSPPSSSSSSPPPGPSSSSSGSPGPSSPG#GPSSPGGGPPSSSSPSSSSPPPPSSPSSPPSSPPPPPSSSSSSPPPSSSSSSSPGPSSPG#GPSSPGGGGPPSSSSSBBSSSSSSSSSSPPSSSSSSPPPSSSSSSZSSPPPPPPGPSSPG#GPSSPGGGGGPPSSSSBBSSSSSSSSSSPPSPPPPSSSPPPSSSSZSSPPSSPGGPSSPG#GPSSPGGGGGGPPPPSSSSPPPPPPPPPPPSPPSSSSSSPPPPPPPSSPPSSPTTPSSPG#GPSSPGGGGGGGGGPPSSPPSSSSSSSSGPSSSSPPSSSSPPGTGPSSSSSSPTGPSSPG#GPSSPGGGGGGBBBGPSSSSSSSSSSSSSPPPPPPPPSSSSPPGPPSSSSSSPTTPSSPG#GPSSPGGGGGGBBBGPSSSSSSPPPPSSSSSSSSSSPPSSSSPPPSSSPPPPPTTPSSPG#GPSSPGGGGGGBBBGPSSPPPPPGGPPSSSSSSSSSSPPSSSSPSSSSPBBBBTGPSSPG#GPSSPGPPPPPPPPPPSSPGGGGGGGPPPPPPPPSSSSPPSSSSSSSPPBBBBBGPSSPG#GPSSPGPSSSSSSSSSSSPGGGGGGGGGGGBBGPPSSSSPPSSSSSPPGGGGGGGPSSPG#GPSSPGPSSSSSSSSSSSPGGGGBGGGGGGBBGGPPSSSSPPPPSSSPPPPPPGTPSSPG#GPSSPGPSSPPPPPPPSSPGGGGGGGGGGGGGGGGPPSSSSSSPSSSSSSSSPGTPSSPG#GPSSPGPSSPBGBBBPSSPGGGGGGGGGGPPPPGGGPPSSSSSPPSSSSSSSPGTPSSPG#GPSSPGPSSPBGBBBPSSPGGGGGGGGGPPSSPPGGGPPPPPPPPPPPPPZZPPGPSSPG#GPZZPPPZZPPPPPPPSSPPPPPPPPPPPSSSSPPPPPPPPPPPPPPPPSSSSPPPZZPG#GPSSSSSSSSSSSSSSSSSSSSSSSSSSSSBBSSSSSSSSSSSSSSSSSSBBSSSSSSPG#GPSSSSSSSSSSSSSSSSSSSSSSSSSSSSBBSSSSSSSSSSSSSSSSSSBBSSSSSSPG#GPZZPPPPPPPPPPPPPPPPSSPPPPPPPSSSSPPPPPPPSSPPPPPPPSSSSPPPZZPG#GPSSPGPSSSSPPBBBBPPSSSPGGPPPPPSSPPPPPGGPSSSPPGBBPPSSPPGPSSPG#GPSSPBPSSSSSPBBBBPSSSSPBBPSSSSSSSSSSPGGPSSSSPGBBGPSSPGBPSSPG#GPSSPBPPPSSSPGGGGPSSSPPGGPSSSSSSSSSSPGGPPSSSPGGGGPSSPGBPSSPG#GPSSPGGGPPSSPGGGGPSSPPGGGPSSPPPPPPSSPGGGPPSSPGGGGPSSPGBPSSPG#GPSSPGGBBPSSPGGGGPSSPGGGBPSSPGGGGPSSPGGGGPSSPGGGGPSSPGBPSSPG#GPSSPGGBBPSSPGGGGPSSPGBBBPSSPGGGGPSSPGGGGPSSPGGGGPSSPGBPSSPG#GPSSPGPPPPSSPPPPPPZZPPPPPPZZPPPPPPSSPPPPPPZZPPPPPPZZPPGPSSPG#GPSSPBPSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSZSSZSSSSSSSSPBPSSPG#GPSSPBPSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSZSSZSSSSSSSSPBPSSPG#GPSSPGPSSPPPPPSSPPPPPPPPPPPPZZPPPPPZZPPPPPSSPPPPPSSPPPBPSSPG#GPSSPBPSSPGGGPSSPGGGGGGGBBBPSSPGGGPSSPBBGPSSPGBBPSSPBGBPSSPG#GPSSPBPSSPGGGPSSPGGGGGGGBBBPSSPGGGPSSPBBGPSSPGBBPSSPBGBPSSPG#GPSSPGPSSPPPPPZZPPPPPPPPPPPPSSPPPPPSSPPPPPSSPPPPPSSPPGGPSSPG#GPSSPGPSSSSSSZSSZSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSPGBPSSPG#GPSSPGPSSSSSSZSSZSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSPGBPSSPG#GPSSPGPPSSPPPPZZPPPPSSPPPPZZPPPPSSPPPPPPPPPPSSPPPPZZPGBPSSPG#GPSSPGGPSSPBBPSSPBBPSSPGBPSSPBGPSSPGGGGGGGGPSSPGGPSSPGBPSSPG#GPSSPGGPSSPBBPSSPBBPSSPBBPSSPBGPSSPGGGGGGGGPSSPGGPSSPGBPSSPG#GPSSPGGPSSPPPPSSPPPPZZPPPPSSPPPPZZPPPPPPPPPPZZPPPPSSPGGPSSPG#GPSSPGGPSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSPPPGGPSSPG#GPSSPGGPSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSPGGGGPSSPG#GPSSPGGPPPPPPPPPPPPPPPPPPPPPPSSPPPPPPPPPPPPPPPPPPPPGGGGPSSPG#GPSSPGGGGGGGGGGGGGBBBBGGBBBBPSSPBBBBGGBBBBGGGGGGGGGGGGGPSSPG#PPSSPPPPPPPPPPPPPPPPPPPPPPPPPSSPPPPPPPPPPPPPPPPPPPPPPPPPSSPP#SSSSZSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSZSSSS#SSSSZSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSZSSSS#PPSSPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPSSPP#GPSSPGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGPSSPG";
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
        var distance = calcPointsDistance(from,across);
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

function calcPointsDistance(a,b){
    a.x = a.x || a.j;
    b.y = b.y || b.i;
    return Math.abs(a.x-b.x) + Math.abs(a.y-b.y);
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