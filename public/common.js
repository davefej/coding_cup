var calledList = [];
var RIGHT_FOLLOW = false;
pathFinder = null;
graph = null;
LEFT = "<"; RIGHT = ">"; UP = "^"; DOWN = "v";

buildGraph = function(){
    graph = createGraph();
    calledList = [];    
    graphBuilder_R();
    addRotations();

    addJardaPoints();


    pathFinder = ngraphPath.aStar(graph, {
        oriented: true,
        distance(fromNode, toNode, link) {
            return link.data.weight;
        }
    });     
}

function addJardaPoints(){
    addLink(8+":"+33,11+":"+33,{weight:3});
    addLink(11+":"+33,8+":"+33,{weight:3});

    addLink(29+":"+39,26+":"+39,{weight:3});
    addLink(26+":"+39,29+":"+39,{weight:3});

    addLink(25+":"+42,23+":"+42,{weight:3});
    addLink(23+":"+42,25+":"+42,{weight:3});    
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

function countedClockWiseDir(dir){
    return clockWiseDir(clockWiseDir(clockWiseDir(dir)));
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
    addLink(i+":"+j,i+":"+(j+1),{weight:2});
    addLink((i+1)+":"+j,(i+1)+":"+(j+1),{weight:2});
    addLink((i+2)+":"+j,(i+2)+":"+(j+1),{weight:2});

    addLink(i+":"+(j+1),i+":"+j,{weight:2});
    addLink((i+1)+":"+(j+1),(i+1)+":"+j,{weight:2});
    addLink((i+2)+":"+(j+1),(i+2)+":"+j,{weight:2});
}

function addVerticalRotations(i,j){
    addLink(i+":"+j,(i+1)+":"+j,{weight:2});
    addLink(i+":"+(j+1),(i+1)+":"+(j+1),{weight:2});
    addLink(i+":"+(j+2),(i+1)+":"+(j+2),{weight:2});

    addLink((i+1)+":"+j,i+":"+j,{weight:2});
    addLink((i+1)+":"+(j+1),i+":"+(j+1),{weight:2});
    addLink((i+1)+":"+(j+2),i+":"+(j+2),{weight:2});
}

function pointFromIJ(i,j){
    return {i:i,j:j};
}

function addLink(fromStr,toStr,options){
    if(typeof window != "undefined"){
        if(!window.graphLinks){
            window.graphLinks = [];
        }
        window.graphLinks.push({
            from:{
                x:fromStr.split(":")[1],
                y:fromStr.split(":")[0]
            },
            to:{
                x:toStr.split(":")[1],
                y:toStr.split(":")[0]
            }
        });
    }
    graph.addLink(fromStr,toStr,options);
}

function startLinkAnimation(){
    window.drawLinks = JSON.parse(JSON.stringify(window.graphLinks)); 
    drawLink();
}
var lastDrawed = null;
var drawsame = true;
function drawLink(){
    
    var link = window.drawLinks.shift();
    if(!link){
        return;
    }
    if(drawsame){
        drawLine(link.from,link.to);
    }else{
        if(!isSameLine(lastDrawed,link)){        
            if(lastDrawed){
                drawLine(lastDrawed.from,lastDrawed.to);
            }    
        }    
    }
    lastDrawed = link;
    setTimeout(drawLink,document.getElementById("stepdelay").value)
}

function isSameLine(line1,line2){
    if(line1 && line2 && line1.from.x == line2.from.x && line1.from.y == line2.from.y){
        if(line1.to.y == line2.to.y || line1.to.x == line2.to.x){
            return true;
        }        
    }
    return false;
}




//////////////ROBi FÉLE ALG/////////

function graphBuilder_R(){

    for(var i = 0; i < GAME.gameMatrix.length; i++){
        for(var j = 0; j < GAME.gameMatrix.length; j++){
            var point = {
                x:j,
                y:i
            };
            var ret = isRSD(point);
            if(ret){
                findStreets_RIGHT({
                        x:ret.x,
                        y:ret.y
                    },
                    ret.dir
                );
            }
        }
    }
}

function findStreets_RIGHT(from,direction){
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
        findStreets_RIGHT(curveDirection.point,curveDirection.direction);
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
            addLink(from.i+":"+from.j,to.i+":"+to.j,{weight:calcWeight(from,to,distance)});
        }else{
            break;
        }
    }

    if(isAszfalt(nextPoint(from,direction,1))){
        findStreets_RIGHT(nextPoint(from,direction,1),direction);
    }else{
        if(!isAszfalt(nextPoint(from,clockWiseDir(direction),1))){
            if(isAszfalt(nextPoint(from,countedClockWiseDir(direction),1))){
                console.warn("COUNTED CLOCKWISE DIR!!");
                findStreets_RIGHT(from,countedClockWiseDir(direction));
            }
        }
    }
}



function isRSD(from,direction) {
    from.dir = direction;
    var up = isAszfalt({
        x: from.x,
        y: from.y - 1
    });
    var right = isAszfalt({
        x: from.x + 1,
        y: from.y
    });
    var down = isAszfalt({
        x: from.x,
        y: from.y + 1
    });
    var left = isAszfalt({
        x: from.x - 1,
        y: from.y
    });
    if (from.dir == RIGHT) {
        if (down) {
            return {
                x: from.x,
                y: from.y + 1,
                dir: DOWN
            };
        } else if (right) {
            return {
                x: from.x + 1,
                y: from.y,
                dir: RIGHT
            };
        } else if (up) {
            return {
                x: from.x,
                y: from.y - 1,
                dir: UP
            };
        }
    } else if (from.dir == LEFT) {
        if (up) {
            return {
                x: from.x,
                y: from.y - 1,
                dir: UP
            };
        } else if (left) {
            return {
                x: from.x - 1,
                y: from.y,
                dir: LEFT
            };
        } else if (down) {
            return {
                x: from.x,
                y: from.y + 1,
                dir: DOWN
            };
        }
    } else if (from.dir == UP) {
        if (right) {
            return {
                x: from.x + 1,
                y: from.y,
                dir: RIGHT
            };
        } else if (up) {
            return {
                x: from.x,
                y: from.y - 1,
                dir: UP
            };
        } else if (left) {
            return {
                x: from.x - 1,
                y: from.y,
                dir: LEFT
            };
        }
    } else if (from.dir == DOWN) {
        if (left) {
            return {
                x: from.x - 1,
                y: from.y,
                dir: LEFT
            };
        } else if (down) {
            return {
                x: from.x,
                y: from.y + 1,
                dir: DOWN
            };
        } else if (right) {
            return {
                x: from.x + 1,
                y: from.y,
                dir: RIGHT
            };
        }
    } else if (!right && left && up && down) {
        var up_right = isAszfalt({
            x: from.x + 1,
            y: from.y - 1
        });
        if (up_right) {
            from.dir = UP;
            return {
                x: from.x,
                y: from.y - 1,
                dir: UP
            };
        }
    } else if (!up && !right && left && down) {
        from.dir = UP;
        return {
            x: from.x - 1,
            y: from.y,
            dir: LEFT
        };
    } else {
        console.info("Not RSD " + JSON.stringify(from));
    }
    return null;
}