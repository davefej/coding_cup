/**
 * COLLISION DETECTION LOGIC
 */
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

function transformedSeenCoords(dir) {
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

let normals = {
    '^': {x: 0, y: -1},
    '>': {x: 1, y: 0},
    '<': {x: -1, y: 0},
    'v': {x: 0, y: 1}
};

function canvas_arrow(context, fromx, fromy, tox, toy, r){
    var x_center = tox;
    var y_center = toy;

    var angle;
    var x;
    var y;

    context.beginPath();

    angle = Math.atan2(toy-fromy,tox-fromx)
    x = r*Math.cos(angle) + x_center;
    y = r*Math.sin(angle) + y_center;

    context.moveTo(x, y);

    angle += (1/3)*(2*Math.PI)
    x = r*Math.cos(angle) + x_center;
    y = r*Math.sin(angle) + y_center;

    context.lineTo(x, y);

    angle += (1/3)*(2*Math.PI)
    x = r*Math.cos(angle) + x_center;
    y = r*Math.sin(angle) + y_center;

    context.lineTo(x, y);

    context.closePath();

    context.fill();
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
        }
        return car;
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

    fpos_myCar = FuturePosCalculator(myCar);
    dx_myCar = fpos_myCar.x - myCar.pos.x;
    dy_myCar = fpos_myCar.y - myCar.pos.y;

    for(let car of carsSeen){
        fpos_object = FuturePosCalculator(car);
        
        dx_object = fpos_object.x - car.pos.x;
        dy_object = fpos_object.y - car.pos.y;
    }
}

var interface = {
    mapCoordsSeenByCar: mapCoordsSeenByCar,
    isDanger: isDangerV2,
    isSeen: isSeen
};

CollisionDetector = interface;
try {
    module.exports = interface;
} catch (e) {}