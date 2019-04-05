var calledList = [];
var RIGHT_FOLLOW = false;
pathFinder = null;
graph = null;
LEFT = "<"; RIGHT = ">"; UP = "^"; DOWN = "v";

buildGraph = function(brd){
    graph = createGraph();
  
    calledList = [];
    findStreetsFromPoint({i:3,j:0},RIGHT);
    addRotations(brd);

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




    debugger;
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
                        console.error("Not GOOD",from,to)
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
        return board.matrix[point.i][point.j] == ASZFALT || board.matrix[point.i][point.j] == ZEBRA;
    }catch(e){
        console.warn("Isaszfalt outofbound")
    }
}

isJarda = function(point){
    point = normalizePoint(point);
    try{
        return board.matrix[point.i][point.j] == JÁRDA;
    }catch(e){
        console.warn("Outofbound JÁRDA")
        return false;
    }    
}

calcWeight = function(from,dest,distance){
    if(distance > 5){
        return 5 + Math.floor((distance-5) / 3)
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
    return point;
}


function addMagicPoints(){
    for(var i = 2; i <=3; i++){
        for(var j = 2; j <= 3; j++){
            graph.addLink(i+":"+j,(59-i)+":"+j,{weight:calcMagicWeight(i,j)});
            graph.addLink(i+":"+j,i+":"+(59-j),{weight:calcMagicWeight(i,j)});
            graph.addLink((59-i)+":"+j,i+":"+j,{weight:calcMagicWeight(i,j)});
            graph.addLink(i+":"+(59-j),i+":"+j,{weight:calcMagicWeight(i,j)});

            graph.addLink((59-i)+":"+(59-j),(59-i)+":"+j,{weight:calcMagicWeight(i,j)});
            graph.addLink((59-i)+":"+(59-j),i+":"+(59-j),{weight:calcMagicWeight(i,j)});
            graph.addLink((59-i)+":"+j,(59-i)+":"+(59-j),{weight:calcMagicWeight(i,j)});
            graph.addLink(i+":"+(59-j),(59-i)+":"+(59-j),{weight:calcMagicWeight(i,j)});

        }
    }
}
function calcMagicWeight(i,j){
    if(i==j){
        return 5;
    }
    if(Math.abs(i-j)==1){
        return 6;
    }
    return 7;
}

function addAllJárdaNextToAszfalt(){
    for(var i = 0; i < board.matrix.length; i++){
        for(var j = 0; j < board.matrix.length; j++){
            if(isAszfalt({i:i,j:j})){
                if(isJarda({i:i,j:j+1})){
                    graph.addLink(i+":"+j,i+":"+(j+1),{weight:100});
                    graph.addLink(i+":"+(j+1),i+":"+j,{weight:100});
                }
                if(isJarda({i:i,j:j-1})){
                    graph.addLink(i+":"+j,i+":"+(j-1),{weight:100});
                    graph.addLink(i+":"+(j-1),i+":"+j,{weight:100});
                }
                if(isJarda({i:i+1,j:j})){
                    graph.addLink(i+":"+j,(i+1)+":"+j,{weight:100});
                    graph.addLink((i+1)+":"+j,i+":"+j,{weight:100});
                }
                if(isJarda({i:i-1,j:j})){
                    graph.addLink(i+":"+j,(i-1)+":"+j,{weight:100});
                    graph.addLink((i-1)+":"+j,i+":"+j,{weight:100});
                }
            }
        }
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
    if(across.i < 0 || across.j < 0 || across.i >= board.width || across.j >= board.height){
        //Not in map
        return;
    }
    if(isAszfalt(across)){
        var distance = Math.abs(from.i-across.i) + Math.abs(from.j-across.j);
        graph.addLink(from.i+":"+from.j,across.i+":"+across.j,{weight:calcWeight(from,across,distance)});
        findAllLinearStreets(from,{
            i:across.i + (across.i-from.i)/distance,
            j:across.j + (across.j-from.j)/distance
        });
    }
}

nearestAszfaltIfJarda = function (point){
    if(isAszfalt(point)){
        return point;
    }
    if(isAszfalt({x:point.x+1,y:point.y})){
        return {x:point.x+1, y:point.y}
    }
    if(isAszfalt({x:point.x-1, y:point.y})){
        return {x:point.x-1, y:point.y}
    }
    if(isAszfalt({x:point.x, y:point.y+1})){
        return {x:point.x, y:point.y+1}
    }
    if(isAszfalt({x:point.x, y:point.y-1})){
        return {x:point.x, y:point.y-1}
    }

    if(isNextToAszfalt({x:point.x+1,y:point.y})){
        return {x:point.x+1, y:point.y}
    }
    if(isNextToAszfalt({x:point.x-1, y:point.y})){
        return {x:point.x-1, y:point.y}
    }
    if(isNextToAszfalt({x:point.x, y:point.y+1})){
        return {x:point.x, y:point.y+1}
    }
    if(isNextToAszfalt({x:point.x, y:point.y-1})){
        return {x:point.x, y:point.y-1}
    }

    throw Error("Nincs Út a utas mellett");
}


function isNextToAszfalt(point){
    if(isAszfalt({x:point.x+1,y:point.y})){
        return true;
    }
    if(isAszfalt({x:point.x-1, y:point.y})){
        return true;
    }
    if(isAszfalt({x:point.x, y:point.y+1})){
        return true;
    }
    if(isAszfalt({x:point.x, y:point.y-1})){
        return true;
    }
    return false;
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
function addRotations(board){
    for(var i = 0; i < board.matrix.length; i++){
        for(var j = 0; j < board.matrix.length; j++){
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