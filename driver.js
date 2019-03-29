ASZFALT = "S"; ZEBRA = "Z"; JÁRDA = "P";FŰ = "G"; ÉPÜLET = "B"; FA = "T"; LEFT = "<"; RIGHT = ">"; UP = "^"; DOWN = "v";
NO_OP = "NO_OP"; ACCELERATION = "ACCELERATION"; DECELERATION = "DECELERATION";
CAR_INDEX_LEFT = "CAR_INDEX_LEFT"; CAR_INDEX_RIGHT = "CAR_INDEX_RIGHT"; CLEAR = "CLEAR";
FULL_THROTTLE = "FULL_THROTTLE";EMERGENCY_BRAKE = "EMERGENCY_BRAKE"; GO_LEFT = "GO_LEFT"; GO_RIGHT = "GO_RIGHT";

const FREE = 1, HASPASSENGER = 2, GOINGFORPASSENGER = 3, WAITINGIN = 4,WAITINGOUT =5;
var routePoints, car, state = FREE, currentPassenger, waze,stepLog;
module.exports = {
    setPathFinder(pathFinder){
        waze = pathFinder;
    },
    setRoutePlan(nodeList){
        routePoints = formatNodeList(nodeList);
    },
    getRoutePoints(){
        return routePoints
    },
    updateCar(thickData,lastCommand){        
        for(var i = 0; i < thickData.cars.length; i++){
            if(thickData.request_id.car_id == thickData.cars[i].id){
                //console.log("Car before futurecalc",thickData.cars[i],thickData.cars[i].pos)
                car = futureCarPos(thickData.cars[i],lastCommand);
                //console.log("Car agter futurecalc",thickData.cars[i],thickData.cars[i].pos)
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
        return state == HASPASSENGER;
    },
    free(){
        return state == FREE;
    },
    passengerPicked(){
        state = HASPASSENGER;
        this.transportPassenger();
    },
    passangerTransported(){
        console.log("Passanger transported")
        currentPassenger = null;
        state = FREE;
    },
    transportPassenger(){
        if(!currentPassenger){
            throw Error("TransportPassenger but no currentPassenger!");
        }
        this.setRoutePlan(waze.navigate(car.pos,currentPassenger.dest_pos));
    },
    calcNextCommand(){
        if(this.isWaiting()){
            return NO_OP;
        }          
        console.log(state);
        var command = calculateCommand();
        if(command == DECELERATION){
            console.log("STATE changed WAITING");
            if(this.hasPassenger()){
                state = WAITINGOUT;
            }else{
                state = WAITINGIN;
            }
        }
        return command;
    },
    isWaiting(){
        return this.isWaitingOut() || this.isWaitingIn();
    },
    isWaitingOut(){
        return state == WAITINGOUT;
    },
    isWaitingIn(){
        return state == WAITINGIN;
    },
    checkStateChange(){
        if((this.goingForPassenger() || this.isWaitingIn()) && car.passenger_id){
            if(car.passenger_id == currentPassenger.id){
                this.passengerPicked();
            }else{
                throw Error("Wrong passanger picked! "+car.passenger_id+" "+currentPassenger.id);
            }            
        }else{
            if(this.isWaitingOut() && !car.passenger_id){
                this.passangerTransported();
            }
        }
    },
    carPos(){
        return car.pos;
    },
    carDirection(){
        return car.direction;
    },
    commandLog(){
        return stepLog;
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
        if(!toNode){                
            return DECELERATION;                
        }
        var direction = calculateDirection(car.pos,toNode);
        if(direction == car.direction){
            if(calcPointsDistance(car.pos,toNode) == 1){
                if(nextNode){
                    stepLog = "Direction egyenéő nextnode";
                    //rotation
                    return turnCommandFromDirections(car.direction,calculateDirection(toNode,nextNode));
                }else{
                    return NO_OP;                    
                }
            }else{
                //go forward
                if(car.speed == 0){                    
                    stepLog = "Direction egyenlő gyorsítás";
                    return ACCELERATION;                    
                }else{
                    stepLog = "Direction egyenlő noop";
                    return NO_OP;
                }                
            }
        }else{
            if(toNode){
                //rotation
                stepLog = "Direction NEMEGYENLÖ fordulás";
                return turnCommandFromDirections(car.direction,direction);
            }else{
                stepLog = "Direction NEMEGYENLÖ lassítás";
                //final destination stop
                return DECELERATION;
            }   
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
    }else if(lastDirection == DOWN && nextDirection == RIGHT){
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
    from = {
        x:parseInt(from.x),
        y:parseInt(from.y)
    };
    to = {
        x:parseInt(to.x),
        y:parseInt(to.y)
    };
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

function futureCarPos(car,command){
    switch(command){
        case NO_OP:
            futureNO_OP(car);
            break;
        case ACCELERATION:
            car.speed += 1;
            break;
        case DECELERATION:
            car.speed -= 1;
            break;
        case CAR_INDEX_LEFT:
            futureNO_OP(car);
            car.direction =  turnDirectionFromCommandAndDirection(car.direction,CAR_INDEX_LEFT);
            break;
        case CAR_INDEX_RIGHT:
            futureNO_OP(car);
            car.direction =  turnDirectionFromCommandAndDirection(car.direction,CAR_INDEX_RIGHT);
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
}

function futureNO_OP(car){
    switch(car.direction){
        case UP:
            car.pos.y = car.pos.y-1
            return;
        case DOWN:
            car.pos.y = car.pos.y+1
            return;
        case LEFT:
            car.pos.x = car.pos.x-1
            return;
        case RIGHT:
            car.pos.x = car.pos.x+1
            return;
    }
}


function turnDirectionFromCommandAndDirection(direction,command){
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