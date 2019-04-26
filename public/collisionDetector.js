// let DIR_UP = "^";
// let DIR_DOWN = "v";
// let DIR_LEFT = "<";
// let DIR_RIGHT = ">";

// let CMD_NO_OP = "0";
// let CMD_ACCELERATION = "+"; 
// let CMD_DECELERATION = "-";
// let CMD_CAR_INDEX_LEFT = "<";
// let CMD_CAR_INDEX_RIGHT = ">";

let normals = {
    '^': {x: 0, y: -1},
    '>': {x: 1, y: 0},
    '<': {x: -1, y: 0},
    'v': {x: 0, y: 1}
};

/**
 * COLLISION DETECTION LOGIC
 */
let viewArea = [
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

let viewAreaCoords = (function() {
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

function relativeSeenCoordsForDirection(dir) {
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
    var seenRel = relativeSeenCoordsForDirection(car.direction);
    var rv = [];
    seenRel.forEach(c => {
        rv.push({x: c.x + car.pos.x, y: c.y + car.pos.y});
    });
    return rv;
}

/**
 *  UNTESTED FUNCTION !!!
 */
function relativeCoordFromMapCoord(car, mapCoord){
    var p = {
        x: mapCoord.x - car.pos.x,
        y: mapCoord.y - car.pos.y
    };
    if(car.direction === '^'){
        return p;
    }else if(car.direction === 'v'){
        var R = rmatrix(Math.PI);
        return dot(R, p);
    }else if (car.direction === '<'){
        var R = rmatrix(-Math.PI/2.0);
        return dot(R, p);
    }else if(car.direction === '>'){
        var R = rmatrix(Math.PI/2.0);
        return dot(R, p);
    } else {
        throw Error("Invalid car direction: "+dir);
    }
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

function getStatus(myCarId, tickData){
    var myCar = tickData.cars.find(function(c) {return c.id === myCarId});
    
    if(!myCar){
        
        throw Error("Car not found! Car id = ", myCarId);
    }
    if (!GAME.gameMatrix) {
        
        throw Error("GAME.gameMatrix is not defined");
    }
    var relativePointsSeen = relativeSeenCoordsForDirection(myCar.direction);

    var points = [];
    for(let rp of relativePointsSeen){
        var pdata = {};
        pdata.x = rp.x;
        pdata.y = rp.y;
        try{
            pdata.type = GAME.gameMatrix[myCar.pos.y + rp.y][myCar.pos.x + rp.x];
        } catch (e) {};
        if(tickData.cars.length > 0){
            for(let car of tickData.cars){
                if (car.id != myCar.id && car.pos.x == myCar.pos.x + rp.x && car.pos.y == myCar.pos.y + rp.y){
                    pdata.car = {
                        speed: car.speed,
                        direction: car.direction,
                    };
                }
            }
        }
        if(tickData.pedestrians.length > 0){
            for(let ped of tickData.pedestrians){
                if( ped.pos.x == myCar.pos.x+rp.x && ped.pos.y == myCar.pos.y ){
                    pdata.pedestrian = {
                        direction: ped.direction,
                        speed: ped.speed
                    };
                }
            }
        }
        points.push(pdata);
    }
    return {
        speed: myCar.speed,
        life: myCar.life,
        pos: myCar.pos,
        direction: myCar.direction,
        relativePoints: points
    };
}

/** Calculate future pos of an object */
let FuturePosCalculator = {
    calculateFuturePos(obj){
        var fpos = {
            x: normals[obj.direction].x*obj.speed + obj.pos.x,
            y: normals[obj.direction].y*obj.speed + obj.pos.y
        };
        return fpos;
    }
}

function isDangerV3(myCarId, tickData){
    var myCar = tickData.cars.find(function(c) {return c.id === myCarId});
    if(!myCar){
        return;
    }
    var pointsSeen = mapCoordsSeenByCar(myCar);
    var carsSeen = [];
    var pedestriansSeen = [];
    
    /** First, check for cars only */
    if(tickData.cars.length >= 2){

        for(let p of pointsSeen){
            for(let car of tickData.cars){
                if (car.pos.x == p.x && car.pos.y == p.y){
                    carsSeen.push(car);
                }
            }
        }
        
        var fpos_myCar = FuturePosCalculator.calculateFuturePos(myCar);
        var positionsHitByMyCar = [];
        
        for(var k=0; k<=Math.max(Math.abs(fpos_myCar.x-myCar.pos.x), Math.abs(fpos_myCar.y - myCar.pos.y)); k++){
            positionsHitByMyCar.push({
                x: myCar.pos.x + k*normals[myCar.direction].x,
                y: myCar.pos.y + k*normals[myCar.direction].y 
            });
        }

        for(let obj of carsSeen){
            var fpos_obj = FuturePosCalculator.calculateFuturePos(obj);
            var positionsHitByObject = [];

            for(var k=0; k<=Math.max(Math.abs(fpos_obj.x-obj.pos.x), Math.abs(fpos_obj.y - obj.pos.y)); k++){
                positionsHitByObject.push({
                    x: obj.pos.x + k*normals[obj.direction].x,
                    y: obj.pos.y + k*normals[obj.direction].y
                });
            }

            for(let pos of positionsHitByMyCar){
                if (positionsHitByObject.find(function(o){return o.x == pos.x && o.y == pos.y})){
                    var colliding = {
                        myCar: myCar,
                        objectType: 'car',
                        object: obj,
                        collisionDistance: {
                            x: obj.pos.x - myCar.pos.x,
                            y: obj.pos.y - myCar.pos.y
                        }
                    };
                    return colliding;
                }
            }
        }
    }

    /** Now check for pedestrians */
    if(tickData.pedestrians.length){
        
        for(let p of pointsSeen){
            for(let ped of tickData.pedestrians){
                if(ped.pos.x == p.x && ped.pos.y == p.y){
                    pedestriansSeen.push(ped);
                }
            }
        }

        var fpos_myCar = FuturePosCalculator.calculateFuturePos(myCar);
        var positionsHitByMyCar = [];
        
        for(var k=0; k<=Math.max(Math.abs(fpos_myCar.x-myCar.pos.x), Math.abs(fpos_myCar.y - myCar.pos.y)); k++){
            positionsHitByMyCar.push({
                x: myCar.pos.x + k*normals[myCar.direction].x,
                y: myCar.pos.y + k*normals[myCar.direction].y 
            });
        }

        for(let obj of pedestriansSeen){
            var fpos_obj = FuturePosCalculator.calculateFuturePos(obj);
            var positionsHitByObject = [];

            for(var k=0; k<=Math.max(Math.abs(fpos_obj.x-obj.pos.x), Math.abs(fpos_obj.y - obj.pos.y)); k++){
                positionsHitByObject.push({
                    x: obj.pos.x + k*normals[obj.direction].x,
                    y: obj.pos.y + k*normals[obj.direction].y
                });
            }

            for(let pos of positionsHitByMyCar){
                if (positionsHitByObject.find(function(o){return o.x == pos.x && o.y == pos.y})){
                    var colliding = {
                        myCar: myCar,
                        objectType: 'pedestrian',
                        object: obj,
                        collisionDistance: {
                            x: obj.pos.x - myCar.pos.x,
                            y: obj.pos.y - myCar.pos.y
                        }
                    };
                    return colliding;
                }
            }
        }
    }
    
    return undefined;
}

function manageSituation(myCarId, tickData){
    var myCar = tickData.cars.find(function(c) {return c.id === myCarId});
    if(!myCar){
        return;
    }
    var pointsSeen = mapCoordsSeenByCar(myCar);
    
    var carsSeen = [];
    var pedestriansSeen = [];

    /** First, check for cars only */
    if(tickData.cars.length >= 2){

        for(let p of pointsSeen){
            for(let car of tickData.cars){
                if (car.pos.x == p.x && car.pos.y == p.y){
                    carsSeen.push(car);
                }
            }
        }
    }

    /** Now check for pedestrians */
    if(tickData.pedestrians.length){
        
        for(let p of pointsSeen){
            for(let ped of tickData.pedestrians){
                if(ped.pos.x == p.x && ped.pos.y == p.y){
                    pedestriansSeen.push(ped);
                }
            }
        }
    }

    function isBehind(car){
        if ( myCar.direction == '^' ){
            return myCar.pos.y < car.pos.y;
        } else if ( myCar.direction == 'v' ){
            return myCar.pos.y > car.pos.y;
        } else if (myCar.direction == '>') {
            return car.pos.x < myCar.pos.x;
        } else if ( myCar.direction == '<' ){
            return car.pos.x > myCar.pos.x
        }
        return false;
    }

    function isOnRight(car){
        if ( myCar.direction == '^' ){
            return car.pos.x > myCar.pos.x;
        } else if (myCar.direction == 'v') {
            return car.pos.x < myCar.pos.x;
        } else if ( myCar.direction == '>' ){
            return car.pos.y > myCar.pos.y;
        } else if ( myCar.direction == '<'){
            return car.pos.y < myCar.pos.y;
        }
        return false;
    }

    function isOnLeft(car){
        if ( myCar.direction == '^' ){
            return car.pos.x < myCar.pos.x;
        } else if (myCar.direction == 'v') {
            return car.pos.x > myCar.pos.x;
        } else if ( myCar.direction == '>' ){
            return car.pos.y < myCar.pos.y;
        } else if ( myCar.direction == '<'){
            return car.pos.y > myCar.pos.y;
        }
        return false;
    }

    function isFront(car){
        if ( myCar.direction == '^' || myCar.direction == 'v'){
            return car.pos.x == myCar.pos.x;
        } else if ( myCar.direction == '>' ||  myCar.direction == '<'){
            return car.pos.y == myCar.pos.y;
        }
        return false;
    }

    function relativeSpeed(car) {
        return {
            x: car.speed*normals[car.direction].x - myCar.speed*normals[myCar.direction].x,
            x: car.speed*normals[car.direction].y - myCar.speed*normals[myCar.direction].y
        }
    }

    function isDangerous(car) {
        if ( isFront(car) ){
          var vrel =  relativeSpeed(car);
          var n = normals[myCar.direction];

          return (n.x*vrel.x + n.y*vrel.y) + Math.sqrt(vrel.x*vrel.x + vrel.y*vrel.y) < 1e-8;
        } else if ( isOnRight(car) ){
            if (car.speed > 0){
                return (myCar.direction == '^' && car.direction == '<') || (myCar.direction == 'v' && car.direction == '>') || (myCar.direction == '<' && car.direction== 'v') || (myCar.direction=='>' && car.direction=='^');
            }
        }
    }
    
    if(carsSeen.length > 0){
        for(let car of carsSeen){
            if(isBehind(car)){
                continue;
            } else {
                if ( isDangerous(car) ){
                    return EMERGENCY_BRAKE;
                }
            }
        }
        return undefined;
    }
}

var interface = {
    getStatus: getStatus,
    mapCoordsSeenByCar: mapCoordsSeenByCar,
    isDanger: isDangerV3,
    isSeen: isSeen,
    manageSituation: manageSituation,
    relativeSeenCoords: viewAreaCoords,
    relativeSeenCoordsForDirection: relativeSeenCoordsForDirection
};

CollisionDetector = interface;
try {
    module.exports = interface;
} catch (e) {}