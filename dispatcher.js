var waze;
module.exports = {
    setPathFinder(pathFinder){
        waze = pathFinder;
    },
    nextPassenger(carPos,passengersList){
        if(!waze){
            throw Error("Pathfinder not set to dispatcher!");
        }
        console.log("Searching for next passenger..")        
        var before = new Date();  
        var passenger;
        passenger = salesMan(carPos,passengersList);        
        //passenger = findClosestPassanger(carPos,passengersList);
        console.log("Walking salesman: "+(new Date()-before)+" milliseconds");
        return passenger;
    }
};

function dummyClosest(carPos,passengersList){
    //TODO
    return passengersList[0];
}

function findClosestPassanger(carPos,passengersList){
    
    let shortestDistance,passenger;
    for(var i = 0; i < passengersList.length; i++){
        var distanceToPassenger = waze.calcDistance(carPos,passengersList[i].pos);
        var passengerDeliveryDistance = waze.calcDistance(passengersList[i].pos,passengersList[i].dest_pos);        
        var currentDistance = distanceToPassenger + passengerDeliveryDistance;
        if(!shortestDistance || shortestDistance > currentDistance){
            shortestDistance = currentDistance;
            passenger = passengersList[i];
        }
    }
    
    return passenger;
}

function getClosestPassengerFromPoint(point,passengersList){
    let shortestDistance,passenger;
    for(var i = 0; i < passengersList.length; i++){
        var currentDistance = waze.calcDistance(point,passengersList[i].pos);
        currentDistance = currentDistance;
        if(!shortestDistance || shortestDistance > currentDistance){
            shortestDistance = currentDistance;
            passenger = passengersList[i];
        }
    }
    return passenger;
}

function salesMan(carPos,passengersList){
    var ditanceObject = {},fullDistanceObj = {};
    for(var i = 0; i < passengersList.length; i++){
        var pass = passengersList[i];
        ditanceObject[i] = {};
        ditanceObject[i].pickupDistance = waze.calcDistance(carPos,pass.pos);
        ditanceObject[i].deliveryDistance = waze.calcDistance(pass.pos,pass.dest_pos);
        ditanceObject[i].fullDistance = ditanceObject[i].pickupDistance + ditanceObject[i].deliveryDistance;

        fullDistanceObj[i] = {};
        fullDistanceObj[i] = ditanceObject[i].fullDistance;
        for(var j = 0; j < passengersList.length; j++){
            if(i == j){
                continue;
            }
            ditanceObject[i][j] = waze.calcDistance(pass.dest_pos,passengersList[j].pos);
        }
    }
    for(var i = 0; i < passengersList.length; i++){
        nextLevelDistance(passengersList,fullDistanceObj,i,[i],ditanceObject);
    }
    var minSum,resultIndex;
    for(var key in fullDistanceObj){
        if(key.length == passengersList.length){
            if(!minSum || minSum > fullDistanceObj[key]){
                minSum = fullDistanceObj[key];
                resultIndex = key[0];
            }
        }
    }    
    return passengersList[resultIndex];
}


function nextLevelDistance(passengersList,fullDistanceObj,routeHistory,visitedIndexes,ditanceObject){
    for(var i = 0; i < passengersList.length; i++){
        if(visitedIndexes.indexOf(i) > -1){
            continue;
        }
        if(visitedIndexes.length == Object.keys(ditanceObject).length){
            return;
        }
        var currentRoute = routeHistory+""+i;
        fullDistanceObj[currentRoute] = fullDistanceObj[routeHistory] + ditanceObject[visitedIndexes[visitedIndexes.length-1]][i];
        //console.log(currentRoute);
        visitedIndexes.push(i);
        nextLevelDistance(passengersList,fullDistanceObj,currentRoute,visitedIndexes,ditanceObject);
        visitedIndexes.pop();
    }
}

