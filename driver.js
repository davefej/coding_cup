ASZFALT = "S"; ZEBRA = "Z"; JÁRDA = "P";FŰ = "G"; ÉPÜLET = "B"; FA = "T"; LEFT = "<"; RIGHT = ">"; UP = "^"; DOWN = "v";
NO_OP = "NO_OP"; ACCELERATION = "ACCELERATION"; DECELERATION = "DECELERATION";
CAR_INDEX_LEFT = "CAR_INDEX_LEFT"; CAR_INDEX_RIGHT = "CAR_INDEX_RIGHT"; CLEAR = "CLEAR";
FULL_THROTTLE = "FULL_THROTTLE";EMERGENCY_BRAKE = "EMERGENCY_BRAKE"; GO_LEFT = "GO_LEFT"; GO_RIGHT = "GO_RIGHT";

const FREE = 1, HASPASSENGER = 2, GOINGFORPASSENGER = 3;
var routePoints, car, state = FREE, currentPassenger, waze;
module.exports = {
    setPathFinder(pathFinder){
        waze = pathFinder;
    },
    setRoutePlan(nodeList){
        routePoints = formatNodeList(nodeList);
    },
    updateCar(thickData){        
        for(var i = 0; i < thickData.cars.length; i++){
            if(thickData.request_id.car_id == thickData.cars[i].id){
                car = thickData.cars[i];
                return;
            }
        }        
    },
    goForPassenger(passenger){
        if(currentPassenger){
            throw Error("Already has a passenger! "+currentPassenger.id+" "+passenger.id);
        }
        currentPassenger = passenger;
        this.setRoutePlan(waze.navigate(car.pos,currentPassenger.pos));
        state = GOINGFORPASSENGER;
    },
    goingForPassenger(){
        return state == GOINGFORPASSENGER;
    },
    hasPassenger(){
        return HASPASSENGER;
    },
    free(){
        return state == FREE;
    },
    passengerPicked(){
        state = HASPASSENGER;
        this.transportPassenger();
    },
    passangerTransported(){
        currentPassenger = null;
        state = FREE;
    },
    transportPassenger(){
        if(!currentPassenger){
            throw Error("TransportPassenger but no currentPassenger!");
        }
        this.setRoutePlan(waze.navigate(car.pos,currentPassenger.dest_pos));
    },
    calcNextCommand(thick){               
        return calculateCommand();
        
    },
    checkStateChange(){
        if(this.goingForPassenger() && car.passenger_id){
            if(car.passenger_id == currentPassenger.id){
                this.passengerPicked();
            }else{
                throw Error("Wrong passanger picked! "+car.passenger_id+" "+currentPassenger.id);
            }            
        }else{
            if(this.hasPassenger() && !car.passenger_id){
                this.passangerTransported();
            }
        }
    },
    carPos(){
        return car.pos;
    }
};

function calculateCommand(){
    if(isSamepos(car.pos,routePoints[0])){
        routePoints.shift();         
    }
    toNode = routePoints[0];
    nextNode = routePoints[1];
    if(car.speed == 0){
        //firststep at game or stops at passanger
        var direction = calculateDirection(car.pos,toNode);
        if(car.direction != direction){
            return turnCommandFromDirections(car.direction,direction);
        }else{
            return ACCELERATION;
        }        
    }else{
        //HALADUNK 1 vel
        var direction = calculateDirection(car.pos,toNode);
        if(direction == car.direction){
            // JÓ AZ IRÁNY
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
            throw Error("Nem jó irányba fogunk kanyarodni!");
        }
    }
}

function isSamepos(pos1,pos2){
    return pos1.x == pos2.x && pos1.y == pos2.y;
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
    }else{
        console.warn("Something not cool going on");
        return CAR_INDEX_LEFT;
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

function calcPointsDistance(a,b){
    a.x = a.x || a.j;
    b.y = b.y || b.i;
    return Math.abs(a.x-b.x) + Math.abs(a.y-b.y);
}

function formatNodeList(nodes){
    var ret = [];
    for(var i = nodes.length -1; i >= 0; i--){
        var positions = nodes[i].id.split(":");
        ret.push({
            x:positions[1],
            y:positions[0]
        });
    }
    return ret;
}