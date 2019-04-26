ASZFALT = "S"; ZEBRA = "Z"; JÁRDA = "P";FŰ = "G"; ÉPÜLET = "B"; FA = "T"; LEFT = "<"; RIGHT = ">"; UP = "^"; DOWN = "v";
SÍN="R", VASUTZEBRA="C", VASUTAUTO="X";
NO_OP = "NO_OP"; ACCELERATION = "ACCELERATION"; DECELERATION = "DECELERATION";
CAR_INDEX_LEFT = "CAR_INDEX_LEFT"; CAR_INDEX_RIGHT = "CAR_INDEX_RIGHT"; CLEAR = "CLEAR";
FULL_THROTTLE = "FULL_THROTTLE"; EMERGENCY_BRAKE = "EMERGENCY_BRAKE"; GO_LEFT = "GO_LEFT"; GO_RIGHT = "GO_RIGHT";

const FREE = 1, HASPASSENGER = 2, GOINGFORPASSENGER = 3, WAITINGIN = 4,WAITINGOUT =5, CRASHED = 6, PASSENGER_LOST = 7;
var routePoints, car, state = FREE, currentPassenger, waze,stepLog;
var teleporting = 0,rev_direction = false;

var CollisionDetector = require("./public/collisionDetector.js");

module.exports = {
    setPathFinder(pathFinder){
        waze = pathFinder;
    },
    setRoutePlan(nodeList){
        routePoints = nodeList;
    },
    getRoutePoints(){
        return routePoints
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
        return state == HASPASSENGER;
    },
    free(){
        return state == FREE;
    },
    passengerPicked(){
        state = HASPASSENGER;
        console.log("Passenger picked!")
        this.transportPassenger();
    },
    passangerTransported(){
        console.log("Passengers transported: "+ (car.transported || 0))
        currentPassenger = null;
        state = FREE;
    },
    transportPassenger(){
        if(!currentPassenger){
            throw Error("TransportPassenger but no currentPassenger!");
        }
        this.setRoutePlan(waze.navigate(car.pos,currentPassenger.dest_pos));
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
    checkStateChange(thick){

        if(this.goingForPassenger(),this.isLostPassenger(thick)){
            currentPassenger = null;
            state = PASSENGER_LOST;
            return;
        }


        if((this.goingForPassenger() || this.isWaitingIn()) && car.passenger_id){
            if(car.passenger_id == currentPassenger.id){
                this.passengerPicked();
            }else{
                console.warn("Wrong passanger picked! " + car.passenger_id + " " + currentPassenger.id);
                for(var i = 0; i <thick.passengers.length; i++){
                    if(thick.passengers[i].id == car.passenger_id){
                        currentPassenger = thick.passengers[i];
                        console.warn("Wrong passenger now Updated");
                        break;
                    }
                }                
            }            
        }else{
            if(this.isWaitingOut() && !car.passenger_id){
                this.passangerTransported();
            }
        }
    },
    isLostPassenger(thick){
        if(!currentPassenger){
            return false;
        }
        for(var i = 0; i < thick.passengers.length; i++){
            if(thick.passengers[i].id == currentPassenger.id){
                return false;
            }
        }
        console.warn("LOst passenger!!!");
        return true;
    },
    carPos(){
        return car.pos;
    },
    carDirection(){
        return car.direction;
    },
    carLife(){
        return car.life;
    },
    crash(){
        currentPassenger = null;
        this.free();
    },
    commandLog(){
        return stepLog;
    },
    reset(){
        car = undefined;
    },
    isLostPassengerState(){
        return PASSENGER_LOST == state;
    },
    calcNextCommand(lastCommand, tickData){
        if(this.isLostPassengerState()){
            if(car.speed > 0){
                return DECELERATION;
            }else{
                this.goForPassenger(dispatcher.nextPassenger(this.carPos(),tickData.passengers));
            }
        }
        var cmdColl = CollisionDetector.manageSituation(car.id, tickData);
        if (cmdColl != undefined) {
            console.warn("SATUFÉK NYOMVA");
            return cmdColl;
        }
        var futureCar = futureCarPos(car,lastCommand);
        car.futureCar = futureCar;
        if(this.isWaiting()){
            if(car.speed != 0){
                console.warn("Várakozunk nem 0 sebességgel!");
                return NO_OP;                
            }
            return NO_OP;
        }
        if(this.free()){
            throw Error("Calculate command in free state");
        }
        if(!isAszfalt(futureCar.pos)){
            //console.warn("Future Pos nem aszfalt")            
        }
        
        if(isSamepos(futureCar.pos,routePoints[0])){
            rev_direction = false;
            if(routePoints[0].rev && routePoints.length > 1){
                rev_direction = calculateDirection(routePoints[0],routePoints[1]);
            }
            routePoints.shift();
        }
        if(rev_direction){
            console.warn("REVDIRECTIOn");
        }
        var toNode = routePoints[0];
        var nextNode = routePoints[1];        
        if(!toNode){
            if(this.hasPassenger()){
                state = WAITINGOUT;
            }else{
                state = WAITINGIN;
            }
            return DECELERATION;                
        }
        var distanceToNode = calcPointsDistance(futureCar.pos,toNode);        
        var directionToNode = rev_direction ? rev_direction : calculateDirection(futureCar.pos,toNode);
        var nextNodesDirection = calculateDirection(toNode,nextNode);

        car.distanceToNode = distanceToNode;
        car.directionToNode = directionToNode;
        car.nextNodesDirection = nextNodesDirection;
        if(car.speed == 0){ 
            if(futureCar.speed == 0){
                //MOST INDULUNK!! Futurecar == car!!
                if(distanceToNode == 1){
                    //Egy távolság után fordulni kell majd                    
                    if(directionToNode == futureCar.direction){
                        //Jó irányban vagyunk
                        return ACCELERATION;
                    }else{
                        //Rossz irányban vagyunk
                        return turnCommandFromDirections(futureCar.direction,directionToNode);
                    }
                }else{
                    //distanceToNode bigger than one
                    if(directionToNode == futureCar.direction){
                        //Jó irányban vagyunk
                        return ACCELERATION;
                    }else{
                        //Rossz irányban vagyunk
                        return turnCommandFromDirections(futureCar.direction,directionToNode);
                    }
                }
            }else{                
                if(directionToNode == futureCar.direction){                    
                    //rotation
                    if(nextNode && distanceToNode == 1){                        
                        return turnCommandFromDirections(futureCar.direction,nextNodesDirection);
                    }else{
                        return NO_OP;
                    }                    
                }else{
                    return DECELERATION;
                }
            }
        }else if(car.speed == 1){
            if(futureCar.speed == 0){
                //meg fogunk állni
                return NO_OP;
            }else{

                if(distanceToNode == 1){
                    if(nextNode){                        
                        //rotation
                        return turnCommandFromDirections(futureCar.direction,nextNodesDirection);
                    }else{
                        return NO_OP;
                    }
                }else{
                    if(futureCar.direction != directionToNode){
                        return turnCommandFromDirections(futureCar.direction,directionToNode);
                    }else{
                        //go forward check if we can go faster :)
                        if(futureCar.speed < 2 && distanceToNode >= 7){
                            return ACCELERATION;
                        }else{
                            return NO_OP;
                        }
                    }
                }
            }
        }else if(car.speed == 2){
            if(futureCar.speed == 2 && distanceToNode <= 5){
                if(distanceToNode <=2){
                    console.warn("Túl gyorsan közelítjük meg a kanyart");
                }
                return DECELERATION;
            }else{
                if(futureCar.speed < 3 && distanceToNode >= 12){
                    return ACCELERATION;
                }else{
                    return NO_OP;
                }
                
            }            
        }else if(car.speed == 3){
            console.log("Hárommal megyünk!!")
            if(futureCar.speed == 3 && distanceToNode <= 9){                
                return DECELERATION;
            }else{
                return NO_OP;
            }
        }else{
            throw Error("Egyelőre csak max 3 vel mehetünk");
        }
    }
};



function isSamepos(pos1,pos2){
    try{
        return pos1.x == pos2.x && pos1.y == pos2.y;
    }catch(e){
        console.warn("Issamepos error",pos1,pos2);
    }
    
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
        return CAR_INDEX_LEFT;
    }
}

function calculateDirection(from,to){
    if(!to){
        return null;
    }
    from = {
        x:parseInt(from.x),
        y:parseInt(from.y)
    };
    to = {
        x:parseInt(to.x),
        y:parseInt(to.y)
    };

    if (from.x > to.x) {
        return from.rev ? RIGHT : LEFT;
    } else if (from.x < to.x) {
        return from.rev ? LEFT : RIGHT;
    } else if (from.y < to.y) {
        return from.rev ? UP : DOWN;
    } else if (from.y > to.y) {
        return from.rev ? DOWN : UP;
    } else {
        return null;
    }

    /*
    if(isTeleportRoute(from,to)){
        console.log("Magic Point direction",from,to);
        if(from.x > to.x){
            return RIGHT;
        }else if(from.x < to.x){
            return LEFT;
        }else if(from.y < to.y){
            return UP;
        }else if(from.y > to.y){
            return DOWN;
        }    
    }

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
    }*/
}

function calcPointsDistance(a,b){
    a = normalizePoint(a);
    b = normalizePoint(b);

    return Math.abs(a.x-b.x) + Math.abs(a.y-b.y);
    
}


function futureCarPos(car,command){
    car = JSON.parse(JSON.stringify(car));
    switch(command){
        case NO_OP:
            futureNO_OP(car);
            break;
        case ACCELERATION:
            car.speed += 1;
            futureNO_OP(car);
            break;
        case DECELERATION:
            car.speed -= 1;
            futureNO_OP(car);
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
            car.pos.y = car.pos.y-car.speed
            break;
        case DOWN:
            car.pos.y = car.pos.y+car.speed
            break;
        case LEFT:
            car.pos.x = car.pos.x-car.speed
            break;
        case RIGHT:
            car.pos.x = car.pos.x+car.speed
            break; 
    }

    if(car.pos.x > 59 ){
        car.pos.x = car.pos.x - 60;        
    }else if(car.pos.x < 0){
        car.pos.x = 60 + car.pos.x;
    }
    if(car.pos.y > 59 ){
        car.pos.y = car.pos.y - 59;
    }else if(car.pos.y < 0){
        car.pos.y = 60 + car.pos.y;
    }
    return;
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

function turnAzonnaliCommandFromDirections(lastDirection,nextDirection){
    if(lastDirection == UP && nextDirection == LEFT){
        return GO_LEFT;
    }else if(lastDirection == UP && nextDirection == RIGHT){
        return GO_RIGHT;
    }else if(lastDirection == DOWN && nextDirection == LEFT){
        return GO_RIGHT;
    }else if(lastDirection == DOWN && nextDirection == RIGHT){
        return GO_LEFT;
    }else if(lastDirection == LEFT && nextDirection == UP){
        return GO_RIGHT;
    }else if(lastDirection == LEFT && nextDirection == DOWN){
        return GO_LEFT;
    }else if(lastDirection == RIGHT && nextDirection == UP){
        return GO_LEFT;
    }else if(lastDirection == RIGHT && nextDirection == DOWN){
        return GO_RIGHT;
    }else{
        throw Error("180 as azonnalit nem adhatunk ki")
    }
}

