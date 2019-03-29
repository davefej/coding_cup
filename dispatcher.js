var waze;
module.exports = {
    setPathFinder(pathFinder){
        waze = pathFinder;
    },
    nextPassenger(carPos,passengersList){
        if(!waze){
            throw Error("Pathfinder not set to dispatcher!");
        }
        //return dummyClosest(carPos,passengersList);
        try{
            return findClosestPassanger(carPos,passengersList);
        }catch(e){
            console.error("Útkeresés Nem útra");
            throw Error(e);
        }
        
        //return travellingSalesMan(carPos,passengersList);
    }
};

function dummyClosest(carPos,passengersList){
    //TODO
    return passengersList[0];
}

function findClosestPassanger(carPos,passengersList){
    let shortestDistance,passenger;
    for(var i = 0; i < passengersList.length; i++){        
        var currentDistance = waze.calcDistance(carPos,passengersList[i].pos);
        if(!shortestDistance || shortestDistance > currentDistance){
            shortestDistance = currentDistance;
            passenger = passengersList[i];
        }
    }
    return passenger;
}
