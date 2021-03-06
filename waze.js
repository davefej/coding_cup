ngraphPath = require('ngraph.path');
createGraph = require('ngraph.graph');
require('./public/common.js');
var robiBuilder = require('./public/robiGraph.js');
graph = null;
pathFinder = null;

module.exports  = {
    build(){
        var P = {};
        P.ctx = {};
        graph = createGraph();
        robiBuilder.buildMap(P);  
        pathFinder = ngraphPath.aStar(graph, {
            oriented: true,
            distance(fromNode, toNode, link) {
                return link.data.weight;
            }
        });        
    },
    navigate(from,to){       
        var nodes = makePathFinding(from,to);       
        return formatNodeList(nodes);
    },
    calcDistance(from,to){
        var nodes = makePathFinding(from,to);
        var sum = 0;
        for(var i = nodes.length-1; i > 0; i--){
            var akt = nodes[i].id.split(":");
            var next = nodes[i-1].id.split(":");
            sum += (Math.abs(akt[0]-next[0]) + Math.abs(akt[1]-next[1]));
        }
        return sum;            
    }
};

function makePathFinding(from,to){
    from = normalizePoint(from);
    to = normalizePoint(to);
    var fromAszfalt = nearestAszfaltIfJarda(from);
    var toAszfalt = nearestAszfaltIfJarda(to);
    try{
        var nodes = pathFinder.find(fromAszfalt.x+":"+fromAszfalt.y,toAszfalt.x+":"+toAszfalt.y);
        var newNodes = [];
        for(var i = 0; i < nodes.length; i++){
            var split = nodes[i].id.split(":");
            var str = split[1]+":"+split[0];
            if(split.length > 2){
                str += ":"+split[2];
            }
            newNodes.push({id:str})
        }


    }catch(e){
        console.error("Nem Útra útkeresés "+fromAszfalt.y+":"+fromAszfalt.x+" "+toAszfalt.y+":"+toAszfalt.x)
        throw Error(e);
        
    }
    if(fromAszfalt.jardaToGO){
        console.warn("JARDATOGO!! fromAszfalt",fromAszfalt);
        newNodes.push({id:fromAszfalt.jardaToGO.y+":"+fromAszfalt.jardaToGO.x})
    }
    if(toAszfalt.jardaToGO){
        console.warn("JARDATOGO!! toAszfalt",toAszfalt);
        newNodes.unshift({id:toAszfalt.jardaToGO.y+":"+toAszfalt.jardaToGO.x})
    }
    if(newNodes.length == 0){
        console.warn("Rossz útvonal liks", graph.getLinks(fromAszfalt.y+":"+fromAszfalt.x), graph.getLinks(toAszfalt.y+":"+toAszfalt.x));
        throw Error("Rossz útvonal!!!"+from.y+":"+from.x+" "+to.y+":"+to.x+" "+fromAszfalt.y+":"+fromAszfalt.x+" "+toAszfalt.y+":"+toAszfalt.x);
    }
    return newNodes;
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


    if(isNextToAszfalt({x:point.x+1,y:point.y})){
        var aszfaltPoint = isNextToAszfalt({x:point.x+1,y:point.y});
        aszfaltPoint.jardaToGO = {x:point.x+1,y:point.y};
        return aszfaltPoint;
    }
    if(isNextToAszfalt({x:point.x-1, y:point.y})){
        var aszfaltPoint =   isNextToAszfalt({x:point.x-1, y:point.y});
        aszfaltPoint.jardaToGO = {x:point.x-1,y:point.y};
        return aszfaltPoint;
    }
    if(isNextToAszfalt({x:point.x, y:point.y+1})){
        var aszfaltPoint =  isNextToAszfalt({x:point.x, y:point.y+1});
        aszfaltPoint.jardaToGO = {x:point.x,y:point.y+1};
        return aszfaltPoint;
    }
    if(isNextToAszfalt({x:point.x, y:point.y-1})){
        var aszfaltPoint = isNextToAszfalt({x:point.x, y:point.y-1})
        aszfaltPoint.jardaToGO = {x:point.x,y:point.y-1};
        return aszfaltPoint;
    }
    throw Error("Nincs Út a utas mellett");
}

function isNextToAszfalt(point){
    if(isAszfalt({x:point.x+1,y:point.y})){
        return {x:point.x+1,y:point.y};
    }
    if(isAszfalt({x:point.x-1, y:point.y})){
        return {x:point.x-1, y:point.y};
    }
    if(isAszfalt({x:point.x, y:point.y+1})){
        return {x:point.x, y:point.y+1};
    }
    if(isAszfalt({x:point.x, y:point.y-1})){
        return {x:point.x, y:point.y-1};
    }
    return false;
}


function formatNodeList(nodes){
    if(nodes.length == 0){
        console.error("Empty nodes list!! in formatNodeList");
    }
    var ret = [];
    for(var i = nodes.length -1; i >= 0; i--){
        var positions = nodes[i].id.split(":");
        var pos = {
            x:parseInt(positions[1]),
            y:parseInt(positions[0])
        };
        if (positions.length > 2 && positions[2] == "c") {
            pos.rev = 1;
            ret.pop();
        }
        ret.push(pos);
    }
    var resultArr = [];
    resultArr.push(ret[0]);
    for(var i = 1; i < ret.length-1; i++){
        if(ret[i-1].x == ret[i].x && ret[i].x == ret[i+1].x){
            continue;
        }
        if(ret[i-1].y == ret[i].y && ret[i].y == ret[i+1].y){
            continue;
        }
        resultArr.push(ret[i]);
    }
    resultArr.push(ret[ret.length-1]);
    return resultArr;
}