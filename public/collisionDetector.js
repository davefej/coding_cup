let DIR_UP = "^";
let DIR_DOWN = "v";
let DIR_LEFT = "<";
let DIR_RIGHT = ">";

let CMD_NO_OP = "0";
let CMD_ACCELERATION = "+"; 
let CMD_DECELERATION = "-";
let CMD_CAR_INDEX_LEFT = "<";
let CMD_CAR_INDEX_RIGHT = ">";

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

        // if(carsSeen.length){
        //     debugger;
        // }
        
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

function isDangerV1(myCar, tickData){
    /**
     * Iterate over all the points, I can see. 
     * If pedestrian or car can be seen then check if collision is possible by calculating the relative velocity
     * If the collision is possible return true
     */
    var carsSeen = [];
    var pedestriansSeen = [];
    var pointsSeen = mapCoordsSeenByCar(myCar);

    var colliding = undefined;

    for(let p of pointsSeen){
      for(let car of tickData.cars){
           if (car.pos.x == p.x && car.pos.y == p.y){
               carsSeen.push(car);
           }
       }
       for(let ped of tickData.pedestrians){
           if (ped.pos.x == p.x && ped.pos.y == p.y){
               pedestriansSeen.push(ped);
           }
       }
    }

    for(let obj of carsSeen){
        // calculate relative speed
        var dv = {
            x: obj.speed*normals[obj.direction].x - myCar.speed*normals[myCar.direction].x,
            y: obj.speed*normals[obj.direction].y - myCar.speed*normals[myCar.direction].y
        };
        
        // calculate relative position
        dx = obj.pos.x - myCar.pos.x;
        dy = obj.pos.y - myCar.pos.y;

        // Calculate relative speed in polar coordinates:
        // https://math.stackexchange.com/a/2444977/263118
        dvr = (dx*dv.x + dy*dv.y)/Math.sqrt(1e-6 + dx*dx + dy*dy);
        dvtheta = (dx*dv.y - dv.x*dy)/(1e-3 + dx*dx + dy*dy);

        if( (dv.x < 0 && dv.y < 0) || (dx == 0 && dv.y < 0) || (dv.x < 0 && dy == 0) || dvr < 0 ){
            colliding = {
                car: myCar,
                objectType: 'car',
                object: obj,
                dv: {dvr: dvr, dvtheta: dvtheta, dvx: dv.x, dvy: dv.y}
            };
            return colliding;
        }
    }

    /*
    for(let obj of pedestriansSeen){
        // calculate relative speed
        var dv = {
            x: obj.speed*normals[obj.direction].x - myCar.speed*normals[myCar.direction].x,
            y: obj.speed*normals[obj.direction].y - myCar.speed*normals[myCar.direction].y
        };
        
        // calculate relative position
        dx = obj.pos.x - myCar.pos.x;
        dy = obj.pos.y - myCar.pos.y;

        // Calculate relative speed in polar coordinates:
        // https://math.stackexchange.com/a/2444977/263118
        dvr = (dx*dv.x + dy*dv.y)/Math.sqrt(1e-6 + dx*dx + dy*dy);
        dvtheta = (dx*dv.y - dv.x*dy)/(1e-3 + dx*dx + dy*dy);

        if(dvr<0){
            colliding = {
                car: myCar,
                objectType: 'pedestrian',
                object: obj,
                dv: {dvr: dvr, dvtheta: dvtheta, dvx: dv.x, dvy: dv.y}
            };
            return colliding;
        }
    }
    */
    return colliding;
}

function isDangerV2(myCar, tickData){
   var FuturePosCalculator = {
    futurePos: (obj) => {
        var obj = JSON.parse(JSON.stringify(obj));
        var futurePos = undefined;

        switch(obj.command){
            case NO_OP:
                futurePos = FuturePosCalculator.futureNO_OP(obj);
                break;
            case ACCELERATION:
                obj.speed += 1;
                futurePos = FuturePosCalculator.futureNO_OP(obj);
                break;
            case DECELERATION:
                obj.speed -= 1;
                futurePos = FuturePosCalculator.futureNO_OP(obj);
                break;
            case CAR_INDEX_LEFT:
                futurePos = FuturePosCalculator.futureNO_OP(obj);
                obj.direction =  FuturePosCalculator.turnDirectionFromCommandAndDirection(obj.direction,CAR_INDEX_LEFT);
                break;
            case CAR_INDEX_RIGHT:
                futurePos = FuturePosCalculator.futureNO_OP(obj);
                obj.direction =  FuturePosCalculator.turnDirectionFromCommandAndDirection(obj.direction,CAR_INDEX_RIGHT);
                break;
            case CLEAR:            
                break;
            case FULL_THROTTLE:
                break;
            case EMERGENCY_BRAKE:
                break;
            case GO_LEFT:
                break;
            case GO_RIGHT:
                break;
            default:
                console.error("[CollisionDetector]: Cannot calculate futurePos. obj.command="+obj.command+"\n");
                console.error(tickData);
                throw Error();
        }
        if(!futurePos){
            throw Error("[CollisionDetector]: futurePos is undefined");
        }
        return futurePos;
    },
    futureNO_OP: (obj) => {
        fpos = {x: obj.pos.x, y: obj.pos.y};
        switch(obj.direction){
            case UP:
                fpos.y = obj.pos.y-obj.speed;
                break;
            case DOWN:
                fpos.y = obj.pos.y+obj.speed
                break;
            case LEFT:
                fpos.x = obj.pos.x-obj.speed
                break;
            case RIGHT:
                fpos.x = obj.pos.x+obj.speed
                break; 
        }
    
        if(obj.pos.x > 59 ){
            fpos.x = obj.pos.x - 60;        
        }else if(obj.pos.x < 0){
            fpos.x = 60 + obj.pos.x;
        }
        if(obj.pos.y > 59 ){
            fpos.y = obj.pos.y - 59;
        }else if(obj.pos.y < 0){
            fpos.y = 60 + obj.pos.y;
        }
        return fpos;
    },
    turnDirectionFromCommandAndDirection: (direction,command) => {
        if(direction == UP && command == CAR_INDEX_LEFT){
            return LEFT;
        }else if(direction == LEFT && command == CAR_INDEX_LEFT){
            return DOWN;
        }else if(direction == DOWN && command == CAR_INDEX_LEFT){
            return RIGHT;
        }else if(direction == RIGHT && command == CAR_INDEX_LEFT){
            return UP;
        }else if(direction == UP && command == CAR_INDEX_RIGHT){
            return RIGHT;
        }else if(direction == LEFT && command == CAR_INDEX_RIGHT){
            return UP;
        }else if(direction == DOWN && command == CAR_INDEX_RIGHT){
            return LEFT;
        }else if(direction == RIGHT && command == CAR_INDEX_RIGHT){
            return DOWN;
        }
    }
   };

   /**
     * Iterate over all the points, I can see. 
     * If pedestrian or car can be seen then check if collision is possible by calculating the relative velocity
     * If the collision is possible return true
     */
    var carsSeen = [];
    var pedestriansSeen = [];
    var pointsSeen = mapCoordsSeenByCar(myCar);

    var colliding = undefined;

    for(let p of pointsSeen){
      for(let car of tickData.cars){
           if (car.pos.x == p.x && car.pos.y == p.y){
               carsSeen.push(car);
           }
       }
       for(let ped of tickData.pedestrians){
           if (ped.pos.x == p.x && ped.pos.y == p.y){
               pedestriansSeen.push(ped);
           }
       }
    }

    if (tickData.cars.length >= 2){
        fpos_myCar = FuturePosCalculator.futurePos(myCar);
        for(let car of carsSeen){
            fpos_object = FuturePosCalculator.futurePos(car);
            
            var pos = myCar.pos;
            var pos2 = car.pos;
            var positionsHitByMyCar = [];
            var positionsHitByObject = [];
            while(pos.x != fpos_myCar.x || pos.y != fpos_myCar.y){
                positionsHitByMyCar.push(pos);
                pos.x = pos.x + normals[myCar.direction].x;
                pos.y = pos.y + normals[myCar.direction].y;
            }
            while(pos2.x != fpos_object.x || pos2.y != fpos_object.y){
                positionsHitByObject.push(pos2);
                pos2.x = pos2.x + normals[car.direction].x;
                pos2.y = pos2.y + normals[car.direction].y;
            }
            
            for(let pos of positionsHitByMyCar){
                if (positionsHitByObject.includes(function(o){return o.x == pos.x && o.y == pos.y})){
                    colliding = {
                        myCar: myCar,
                        objectType: 'car',
                        object: car
                    };
                    return colliding;
                }
            }
        }
    }
    
    
}

var interface = {
    getStatus: getStatus,
    mapCoordsSeenByCar: mapCoordsSeenByCar,
    isDanger: isDangerV3,
    isSeen: isSeen,
    relativeSeenCoords: viewAreaCoords,
    relativeSeenCoordsForDirection: relativeSeenCoordsForDirection
};

CollisionDetector = interface;
try {
    module.exports = interface;
} catch (e) {}