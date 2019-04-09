var calledList = [];
var RIGHT_FOLLOW = false;
pathFinder = null;
graph = null;
LEFT = "<"; RIGHT = ">"; UP = "^"; DOWN = "v";

buildGraph = function(){
    graph = createGraph();
    calledList = [];
    findStreetsFromPoint({i:3,j:0},RIGHT);
    addRotations();
    pathFinder = ngraphPath.aStar(graph, {
        oriented: true,
        distance(fromNode, toNode, link) {
            return link.data.weight;
        }
    });     
}

function findStreetsFromPoint(from,direction){    
    if(!isAszfalt(from)){
        return;
    }
    var str = from.i+":"+from.j+"_"+direction;
    if(calledList.indexOf(str) > -1){
        return;
    }
    calledList.push(str);
    var curveDirection = rightNarrowCurve(from,direction);
    if(curveDirection){
        findStreetsFromPoint(curveDirection.point,curveDirection.direction);
    }

    var curve2Direction = leftBigCurve(from,direction);
    if(curve2Direction){
        findStreetsFromPoint(curve2Direction.point,curve2Direction.direction);
    }

    var curveAkadalyDirection = curveAkadaly(from,direction);
    if(curveAkadalyDirection){
        findStreetsFromPoint(curveAkadalyDirection.point,curveAkadalyDirection.direction);
    }

    var oneWayCurveAkadalyDirection = oneWayCurveAkadaly(from,direction);
    if(oneWayCurveAkadalyDirection){
        findStreetsFromPoint(oneWayCurveAkadalyDirection.point,oneWayCurveAkadalyDirection.direction);
    }


    for(var i = 1; i < 59;i++){
        var to = nextPoint(from,direction,i);
        if(isAszfalt(to)){
            if(!isAszfalt(nextPoint(from,direction,i+2))){
                if(isAszfalt(nextPoint(to,clockWiseDir(direction),1))){                    
                    if(isAszfalt(nextPoint(nextPoint(from,direction,i-1),clockWiseDir(direction),1))){
                        console.error("Not GOOD street",from,to)
                        break;
                    }                    
                }        
            }
            var distance = Math.abs(from.i-to.i) + Math.abs(from.j-to.j);
            graph.addLink(from.i+":"+from.j,to.i+":"+to.j,{weight:calcWeight(from,to,distance)});
        }else{
            break;
        }
    }

    if(isAszfalt(nextPoint(from,direction,1))){
        findStreetsFromPoint(nextPoint(from,direction,1),direction);
    }
}

function rightNarrowCurve(from,direction){
    var dir2;
    if(direction == RIGHT){
        dir2 = DOWN;        
    }else if(direction == LEFT){
        dir2 = UP;
    }else if(direction == UP){
        dir2 = RIGHT;
    }else if(direction == DOWN){
        dir2 = LEFT;
    }
    if(!isAszfalt(nextPoint(from,dir2,1))){
        if(isAszfalt(nextPoint(from,direction,1))){
            if(isAszfalt(nextPoint(nextPoint(from,direction,1),dir2,1))){
                return {
                    point:nextPoint(from,direction,1),
                    direction:dir2
                };
            }
        }
    }
}

function curveAkadaly(from,direction){
    var dir2;
    if(direction == RIGHT){
        dir2 = UP;        
    }else if(direction == LEFT){
        dir2 = DOWN;
    }else if(direction == UP){
        dir2 = LEFT;
    }else if(direction == DOWN){
        dir2 = RIGHT;
    }
    if(isAszfalt(nextPoint(from,direction,1))){
        if(!isAszfalt(nextPoint(from,direction,2))){
            if(isAszfalt(nextPoint(from,dir2,1))){
                if(isAszfalt(nextPoint(from,dir2,2))){
                    if(isAszfalt(nextPoint(nextPoint(from,direction,1),dir2,1))){
                        if(isAszfalt(nextPoint(nextPoint(from,direction,1),dir2,2))){
                            if(isAszfalt(nextPoint(nextPoint(from,direction,2),dir2,1))){
                                if(isAszfalt(nextPoint(nextPoint(from,direction,2),dir2,2))){
                                    return {
                                        point:nextPoint(from,direction,1),
                                        direction:dir2
                                    };
                                }
                            }
                        }
                    }
                }
            }
        }
    }
}

function oneWayCurveAkadaly(from,direction){
    var dir2;
    if(direction == RIGHT){
        dir2 = UP;        
    }else if(direction == LEFT){
        dir2 = DOWN;
    }else if(direction == UP){
        dir2 = LEFT;
    }else if(direction == DOWN){
        dir2 = RIGHT;
    }
    if(isAszfalt(nextPoint(from,direction,1))){
        if(!isAszfalt(nextPoint(from,direction,2))){
            if(!isAszfalt(nextPoint(from,dir2,1))){
                if(isAszfalt(nextPoint(nextPoint(from,direction,1),dir2,1))){            
                    if(!isAszfalt(nextPoint(nextPoint(from,direction,1),dir2,-1))){                        
                        return {
                            point:nextPoint(from,direction,1),
                            direction:dir2
                        };
                    }
                }
            }
        }
    }
}

function leftBigCurve(from,direction){
    var dir2;
    if(direction == RIGHT){
        dir2 = UP;        
    }else if(direction == LEFT){
        dir2 = DOWN;
    }else if(direction == UP){
        dir2 = LEFT;
    }else if(direction == DOWN){
        dir2 = RIGHT;
    }
    if(isAszfalt(nextPoint(from,direction,1))){
        if(isAszfalt(nextPoint(from,dir2,1))){
            if(isAszfalt(nextPoint(from,dir2,2))){
                if(isAszfalt(nextPoint(nextPoint(from,direction,1),dir2,1))){
                    if(isAszfalt(nextPoint(nextPoint(from,direction,1),dir2,2))){
                        return {
                            point:nextPoint(from,direction,1),
                            direction:dir2
                        };
                    }
                }
            }
        }
    }
}

function nextPoint(point,dir,distance){
    switch(dir){
        case UP:
            return {
                i:point.i-distance,
                j:point.j
            };
        case DOWN:
            return {
                i:point.i+distance,
                j:point.j
            };
        case RIGHT:
            return {
                i:point.i,
                j:point.j+distance
            };
        case LEFT:
            return {
                i:point.i,
                j:point.j-distance
            };
    }
}

isAszfalt = function(point){
    point = normalizePoint(point);
    try{
        return GAME.gameMatrix[point.i][point.j] == ASZFALT || GAME.gameMatrix[point.i][point.j] == ZEBRA;
    }catch(e){
        console.warn("Isaszfalt outofbound")
    }
}

isJarda = function(point){
    point = normalizePoint(point);
    try{
        return GAME.gameMatrix[point.i][point.j] == JÁRDA;
    }catch(e){
        console.warn("Outofbound JÁRDA")
        return false;
    }    
}

calcWeight = function(from,dest,distance){
    if(distance > 5){
        return 5 + Math.floor((distance-5) / 2);
    }else{
        return distance;
    }
}


normalizePoint = function(point){
    if(typeof point.i == "undefined"){
        point.i = point.y
    }
    if(typeof point.j == "undefined"){
        point.j = point.x
    }
    if(typeof point.x == "undefined"){
        point.x = point.j
    }
    if(typeof point.y == "undefined"){
        point.y = point.i
    }
    point.j = parseInt(point.j);
    point.i = parseInt(point.i);
    point.x = parseInt(point.x);
    point.y = parseInt(point.y);
    return point;
}

function clockWiseDir(dir){
    switch(dir){
        case UP:
            return RIGHT;
        case RIGHT:
            return DOWN;
        case DOWN:
            return LEFT;
        case LEFT:
            return UP;
    }
}

function addRotations(){
    for(var i = 0; i < GAME.gameMatrix.length; i++){
        for(var j = 0; j < GAME.gameMatrix.length; j++){
            if(isAszfalt(pointFromIJ(i,j)) &&
                isAszfalt(pointFromIJ(i+1,j)) &&
                isAszfalt(pointFromIJ(i+2,j)) &&
                isAszfalt(pointFromIJ(i,j+1)) &&
                isAszfalt(pointFromIJ(i+1,j+1)) &&
                isAszfalt(pointFromIJ(i+2,j+1))){
                    addHorizontalRotations(i,j);
            }
            if(isAszfalt(pointFromIJ(i,j)) &&
                isAszfalt(pointFromIJ(i,j+1)) &&
                isAszfalt(pointFromIJ(i,j+2)) &&
                isAszfalt(pointFromIJ(i+1,j)) &&
                isAszfalt(pointFromIJ(i+1,j+1)) &&
                isAszfalt(pointFromIJ(i+1,j+2))){
                    addVerticalRotations(i,j);
            }
        }
    }
}

function addHorizontalRotations(i,j){
    graph.addLink(i+":"+j,i+":"+(j+1),{weight:2});
    graph.addLink((i+1)+":"+j,(i+1)+":"+(j+1),{weight:2});
    graph.addLink((i+2)+":"+j,(i+2)+":"+(j+1),{weight:2});

    graph.addLink(i+":"+(j+1),i+":"+j,{weight:2});
    graph.addLink((i+1)+":"+(j+1),(i+1)+":"+j,{weight:2});
    graph.addLink((i+2)+":"+(j+1),(i+2)+":"+j,{weight:2});
}

function addVerticalRotations(i,j){
    graph.addLink(i+":"+j,(i+1)+":"+j,{weight:2});
    graph.addLink(i+":"+(j+1),(i+1)+":"+(j+1),{weight:2});
    graph.addLink(i+":"+(j+2),(i+1)+":"+(j+2),{weight:2});

    graph.addLink((i+1)+":"+j,i+":"+j,{weight:2});
    graph.addLink((i+1)+":"+(j+1),i+":"+(j+1),{weight:2});
    graph.addLink((i+1)+":"+(j+2),i+":"+(j+2),{weight:2});
}

function pointFromIJ(i,j){
    return {i:i,j:j};
}