
function drawMap(thickData, answerCommand, route){
    GAME.canvasContext.fillStyle = "#ffffff";
    GAME.canvasContext.fillRect(0,0,GAME.gameMatrix[0].length,GAME.gameMatrix.length);
    if (thickData){
        var myCarId = thickData.request_id.car_id;
        GAME.myCar = thickData.cars.find(function(c) {return c.id === myCarId});
        document.getElementById("thicknum").innerHTML = thickData.request_id.tick;
        document.getElementById("step").innerHTML = answerCommand;
        document.getElementById("transportednum").innerHTML = GAME.myCar.transported;
        document.getElementById("life").innerHTML = GAME.myCar.life;
        document.getElementById("gameid").innerHTML = thickData.request_id.game_id;
    }
    // Ha szallitok utast
    if(GAME.myCar && GAME.myCar.passenger_id && thickData.passengers){
        GAME.myPassenger = thickData.passengers.find(function(o){ return o.id == GAME.myCar.passenger_id });
    }else{
        GAME.myPassenger = undefined;
    }
    for(var rowIdx = 0; rowIdx < GAME.gameMatrix.length; rowIdx++){
        for(var colIdx = 0; colIdx < GAME.gameMatrix[rowIdx].length; colIdx++){
            GAME.canvasContext.fillStyle = getColorByField(GAME.gameMatrix[rowIdx][colIdx]);
            GAME.canvasContext.fillRect(colIdx*GAME.mapRatio,rowIdx*GAME.mapRatio,GAME.mapRatio,GAME.mapRatio);
        }
    }
    if(GAME.myCar){
        GAME.canvasContext.fillStyle = "#2196F388";
        GAME.canvasContext.fillRect(GAME.myCar.pos.x*GAME.mapRatio,GAME.myCar.pos.y*GAME.mapRatio,GAME.mapRatio,GAME.mapRatio);

        for(let point of CollisionDetector.mapCoordsSeenByCar(GAME.myCar)){
            GAME.canvasContext.fillStyle = "#FF000044";
            GAME.canvasContext.fillRect(point.x*GAME.mapRatio, point.y*GAME.mapRatio,GAME.mapRatio,GAME.mapRatio);
        }
        // Draw an arrow
        GAME.canvasContext.fillStyle = "#FFFF00";
        fromx = GAME.myCar.pos.x*GAME.mapRatio;
        fromy = GAME.myCar.pos.y*GAME.mapRatio;
        tox = GAME.mapRatio*normals[GAME.myCar.direction].x + fromx;
        toy = GAME.mapRatio*normals[GAME.myCar.direction].y + fromy;
        canvas_arrow(GAME.canvasContext, fromx + 0.5*GAME.mapRatio, fromy + 0.5*GAME.mapRatio, tox + 0.5*GAME.mapRatio, toy + 0.5*GAME.mapRatio, 0.5*GAME.mapRatio);

        // Draw passenger destinations
        if(GAME.myPassenger){
            GAME.canvasContext.fillStyle = "#0000FF";
            GAME.canvasContext.fillRect(GAME.myPassenger.dest_pos.x*GAME.mapRatio, GAME.myPassenger.dest_pos.y*GAME.mapRatio,GAME.mapRatio,GAME.mapRatio);
        }
    }
    if(thickData){
        thickData.pedestrians.forEach(pedestrian => {
            GAME.canvasContext.fillStyle = "#FFFF00";
            GAME.canvasContext.fillRect(pedestrian.pos.x*GAME.mapRatio,pedestrian.pos.y*GAME.mapRatio,GAME.mapRatio,GAME.mapRatio);
        });
        thickData.passengers.forEach(passanger => {
            GAME.canvasContext.fillStyle = "#FFA000";
            GAME.canvasContext.fillRect(passanger.pos.x*GAME.mapRatio,passanger.pos.y*GAME.mapRatio,GAME.mapRatio,GAME.mapRatio);
        });
        thickData.cars.forEach(car => {
            if(GAME.myCar && car.id != GAME.myCar.id){
                for(let point of CollisionDetector.mapCoordsSeenByCar(car)){
             //       GAME.canvasContext.fillStyle = "#FFFF0077";
             //       GAME.canvasContext.fillRect(point.x*GAME.mapRatio, point.y*GAME.mapRatio,GAME.mapRatio,GAME.mapRatio);
                }
                
                // Draw an arrow
                GAME.canvasContext.fillStyle = "#FF00AA";
                fromx = car.pos.x*GAME.mapRatio;
                fromy = car.pos.y*GAME.mapRatio;
                tox = GAME.mapRatio*normals[car.direction].x + fromx;
                toy = GAME.mapRatio*normals[car.direction].y + fromy;
                canvas_arrow(GAME.canvasContext, fromx + 0.5*GAME.mapRatio, fromy + 0.5*GAME.mapRatio, tox + 0.5*GAME.mapRatio, toy + 0.5*GAME.mapRatio, 0.5*GAME.mapRatio);
                
                GAME.canvasContext.fillStyle = "#2196F388";
                GAME.canvasContext.fillRect(car.pos.x*GAME.mapRatio,car.pos.y*GAME.mapRatio,GAME.mapRatio,GAME.mapRatio);
            }
        });
    }
    if(route && route.length >=1){
        GAME.canvasContext.lineWidth = 3;
        GAME.canvasContext.strokeStyle = "#0000FF88";
        b  = GAME.mapRatio/2;
        GAME.canvasContext.beginPath();
        GAME.canvasContext.moveTo(GAME.myCar.pos.x*GAME.mapRatio + b, GAME.myCar.pos.y*GAME.mapRatio + b);
        GAME.canvasContext.lineTo(route[0].x*GAME.mapRatio + b, route[0].y*GAME.mapRatio + b);
        GAME.canvasContext.stroke();
        for(var k=0; k<route.length-1; k++){
            b  = GAME.mapRatio/2;
            GAME.canvasContext.beginPath();
            GAME.canvasContext.moveTo(route[k].x*GAME.mapRatio + b, route[k].y*GAME.mapRatio + b);
            GAME.canvasContext.lineTo(route[k+1].x*GAME.mapRatio + b, route[k+1].y*GAME.mapRatio + b);
            GAME.canvasContext.stroke();
        }
    }
}

function getColorByField(field){
    switch(field){
        case ASZFALT:
            return "#868686";
        case ZEBRA:
            return "#FFFFFF";
        case JÁRDA:
            return "#cfcfcf";
        case FŰ:
            return "#8fbf60";
        case ÉPÜLET:
            return "#b65265";
        case FA:
            return "#1c6718";
    }
}

function mapSizeChanged(value){
    GAME.mapRatio = value;
    var canvas = document.getElementById("canvas"); 
    canvas.width = GAME.gameMatrix[0].length*GAME.mapRatio;
    canvas.height = GAME.gameMatrix.length*GAME.mapRatio;
    canvas.addEventListener("click",function(event){        
            var rect = canvas.getBoundingClientRect();
            var x = event.clientX - rect.left;
            var y = event.clientY - rect.top;
            alert("x: " + Math.floor(x/GAME.mapRatio) + " y: " + Math.floor(y/GAME.mapRatio));        
    })
    GAME.canvasContext = canvas.getContext("2d");
    drawMap();
}


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

function drawLine(from,to){
    GAME.canvasContext.lineWidth = 3;
    GAME.canvasContext.strokeStyle = "#0000FF33";
    GAME.canvasContext.fillStyle = "#ff000088";
    var b  = GAME.mapRatio/2;
    GAME.canvasContext.beginPath();
    GAME.canvasContext.moveTo(from.x*GAME.mapRatio + b, from.y*GAME.mapRatio + b);
    GAME.canvasContext.lineTo(to.x*GAME.mapRatio + b, to.y*GAME.mapRatio + b);
    GAME.canvasContext.stroke();
    GAME.canvasContext.beginPath();
    canvas_arrow(GAME.canvasContext, from.x*GAME.mapRatio + b, from.y*GAME.mapRatio + b, to.x*GAME.mapRatio + b, to.y*GAME.mapRatio + b, b);    
    //GAME.canvasContext.arc(to.x*GAME.mapRatio+b, to.y*GAME.mapRatio+b, b, 0, 2 * Math.PI);
    GAME.canvasContext.fill();
}