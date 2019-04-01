let ngraphPath = require('ngraph.path');
let createGraph = require('ngraph.graph');

var board,graph,pathFinder,built = false;
module.exports  = {
    build(brd){
        board = brd;
        graph = createGraph();
        for(var i = 0; i < board.matrix.length; i++){
            for(var j = 0; j < board.matrix.length; j++){
                findAllLinearStreets({i:i,j:j});
            }
        }
        pathFinder = ngraphPath.aStar(graph, {
            distance(fromNode, toNode, link) {
              return link.data.weight;
            }
        });
    },
    navigate(from,to){
        from = normalizePoint(from);
        to = normalizePoint(to);
        from = nearestAszfaltIfJarda(from);
        to = nearestAszfaltIfJarda(to);
        try{
            return pathFinder.find(from.y+":"+from.x,to.y+":"+to.x);
        }catch(e){
            throw Error("Nem Útora őtkeresés "+from.x+":"+from.y+" "+to.x+":"+to.y)
        }
        
    },
    calcDistance(from,to){
        from = normalizePoint(from);
        to = normalizePoint(to);
        from = nearestAszfaltIfJarda(from);
        to = nearestAszfaltIfJarda(to);
        try{
            var nodes = pathFinder.find(from.y+":"+from.x,to.y+":"+to.x);
        }catch(e){
            throw Error("Nem Útora őtkeresés "+from.x+":"+from.y+" "+to.x+":"+to.y)
        }
        var sum = 0;
        for(var i = nodes.length-1; i > 0; i--){
            var akt = nodes[i].id.split(":");
            var next = nodes[i-1].id.split(":");
            sum += (Math.abs(akt[0]-next[0]) + Math.abs(akt[1]-next[1]));
        }
        return sum;            
    }
};

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

isAszfalt = function(point){
    point = normalizePoint(point);
    return board.matrix[point.i][point.j] == ASZFALT || board.matrix[point.i][point.j] == ZEBRA;
}

function calcWeight(from,dest,distance){
    if(distance > 5){
        return 5 + Math.floor((distance-5) / 3)
    }else{
        return distance;
    }
}

function nearestAszfaltIfJarda(point){
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
    for(var x = -1; x <=1; x++){
        for(var y = -1; y <=1; y++){
            if(isAszfalt({x:point.x+x, y:point.y+y})){
                return {x:point.x+x, y:point.y+y};
            }
        }
    }
    throw Error("Nincs Út a utas mellett");
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