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
    /**
     * This should be changed back to accept only '>', '<', 'v', '^'
     */
    // if (dir === '^' || dir === 'UP'){
    //     return viewAreaCoords;
    // } else if (dir === 'v' || dir === 'DOWN') {
    //     var rotated = [];
    //     var R = rmatrix(Math.PI);
    //     for(var k in viewAreaCoords){
    //         rotated.push(dot(R, viewAreaCoords[k]));
    //     }
    //     return rotated;
    // } else if (dir === 'LEFT' || dir === '<'){
    //     var rotated = [];
    //     var R = rmatrix(Math.PI/2.0);
    //     for(var k in viewAreaCoords){
    //         rotated.push(dot(R, viewAreaCoords[k]));
    //     }
    //     return rotated;
    // } else if (dir === 'RIGHT' || dir === '>'){
    //     var rotated = [];
    //     var R = rmatrix(-Math.PI/2.0);
    //     for(var k in viewAreaCoords){
    //         rotated.push(dot(R, viewAreaCoords[k]));
    //     }
    //     return rotated;
    // } else {
    //     throw Error("Invalid car direction: "+dir);
    // }
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

function isDangerV1(myCar, tickData){
    /**
     * Iterate over all the points, I can see. 
     * If pedestrian or car can be seen then check if collision is possible by calculating the relative velocity
     * If the collision is possible return true
     */
    var carsSeen = [];
    var pedestriansSeen = [];
    var pointsSeen = mapCoordsSeenByCar(car);
    for(let p of pointsSeen){
      for(let car of tickData.cars){
           if (car.pos.x === p.x && car.pos.y === p.y){
               carsSeen.push(car);
           }
       }
       for(let ped of tickData.pedestrians){
           if (ped.pos.x === p.x && ped.pos.y === p.y){
               pedestriansSeen.push(ped);
           }
       }
    }

    var normals = {
        '^': {x: 0, y: -1},
        '>': {x: 1, y: 0},
        '<': {x: -1, y: 0},
        'v': {x: 0, y: 1}
    };

    for(let car of carsSeen){
        var dv = {
            x: car.speed*normals[car.direction].x - myCar.speed*normals[myCar.direction].x,
            y: car.speed*normals[car.direction].y - myCar.speed*normals[myCar.direction].y
        };
        
        if(dv.x < 0 || dy < 0){
            return true;
        }
    }

    for(let ped of pedestriansSeen){
        var dv = {
            x: ped.speed*normals[ped.direction].x - myCar.speed*normals[myCar.direction].x,
            y: ped.speed*normals[ped.direction].y - myCar.speed*normals[myCar.direction].y
        };
        
        if(dv.x < 0 || dy < 0){
            return true;
        }
    }
    return false;
}

function isDangerV2(myCar, tickData){
    /**
     * Iterate over all the points, I can see. 
     * If pedestrian or car can be seen then check if collision is possible
     * If the collision is possible return true
     */
    var carsSeen = [];
    var pedestriansSeen = [];
    var pointsSeen = mapCoordsSeenByCar(car);
    for(let p of pointsSeen){
       for(let car of tickData.cars){
           if (car.pos.x === p.x && car.pos.y === p.y){
               carsSeen.push(car);
           }
       }
       for(let ped of tickData.pedestrians){
           if (ped.pos.x === p.x && ped.pos.y === p.y){
               pedestriansSeen.push(ped);
           }
       }
    }

    /**
     * Four possibilities
     */
    for(let car of carsSeen){
        var dx = car.pos.x - myCar.pos.x;
        var dy = car.pos.y - myCar.pos.y;
        if(dx >= 0 && dy >= 0){

        }else if(dx >= 0 && dy < 0){
            
        }else if(dx < 0 && dy >= 0){

        }else if(dx < 0 && dy < 0){

        }else{
            throw Error("[CollisionDetector] something went bad.");
        }
    }
}

module.exports = {
    isSeen: isSeen,
    isDanger: isDangerV1
};