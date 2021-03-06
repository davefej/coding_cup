
function drawMap(thickData, answerCommand, route){
    var trains = undefined;
    GAME.canvasContext.fillStyle = "#ffffff";
    GAME.canvasContext.fillRect(0,0,GAME.gameMatrix[0].length,GAME.gameMatrix.length);
    if (thickData){
        document.getElementById("thicknum").innerHTML = thickData.request_id.tick;
        document.getElementById("step").innerHTML = answerCommand;
        document.getElementById("transportednum").innerHTML = GAME.myCar.transported;
        document.getElementById("life").innerHTML = GAME.myCar.life;
        document.getElementById("gameid").innerHTML = thickData.request_id.game_id;
        document.getElementById("Transported_Thick").innerHTML = Math.round(Number(thickData.request_id.tick)/Number(GAME.myCar.transported));
        trains = GetTrainPositions(thickData.request_id.tick);
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
                // for(let point of CollisionDetector.mapCoordsSeenByCar(car)){
                //    GAME.canvasContext.fillStyle = "#FFFF0077";
                //    GAME.canvasContext.fillRect(point.x*GAME.mapRatio, point.y*GAME.mapRatio,GAME.mapRatio,GAME.mapRatio);
                // }
                
                // Draw an arrow
                GAME.canvasContext.fillStyle = "#FF00AA";
                fromx = car.pos.x*GAME.mapRatio;
                fromy = car.pos.y*GAME.mapRatio;
                tox = GAME.mapRatio*normals[car.direction].x + fromx;
                toy = GAME.mapRatio*normals[car.direction].y + fromy;
                canvas_arrow(GAME.canvasContext, fromx + 0.5*GAME.mapRatio, fromy + 0.5*GAME.mapRatio, tox + 0.5*GAME.mapRatio, toy + 0.5*GAME.mapRatio, 0.5*GAME.mapRatio);
                
                GAME.canvasContext.fillStyle = "#FF00AA";
                GAME.canvasContext.fillRect(car.pos.x*GAME.mapRatio,car.pos.y*GAME.mapRatio,GAME.mapRatio,GAME.mapRatio);
            }
        });
        //Draw trains
        if(trains){
            GAME.canvasContext.fillStyle = "#FF00AA";
            if(trains[0].isOnMap){
                for(let wagon = trains[0].x; ((wagon >= trains[0].endX)); wagon--)
                {                
                    GAME.canvasContext.fillRect(wagon*GAME.mapRatio,trains[0].y*GAME.mapRatio,GAME.mapRatio,GAME.mapRatio);
                }
            };
            if(trains[1].isOnMap){
                for(let wagon = trains[1].y; (wagon <= trains[1].endY); wagon--)
                {                
                    GAME.canvasContext.fillRect(trains[1].x*GAME.mapRatio,wagon*GAME.mapRatio,GAME.mapRatio,GAME.mapRatio);
                }
            };
            if(trains[2].isOnMap){
                for(let wagon = trains[2].x; (wagon <= trains[2].endX); wagon++)
                {                
                    GAME.canvasContext.fillRect(wagon*GAME.mapRatio,trains[2].y*GAME.mapRatio,GAME.mapRatio,GAME.mapRatio);
                }
            };
            if(trains[3].isOnMap){
                for(let wagon = trains[1].y; (wagon <= trains[1].endY); wagon++)
                {                
                    GAME.canvasContext.fillRect(trains[1].x*GAME.mapRatio,wagon*GAME.mapRatio,GAME.mapRatio,GAME.mapRatio);
                }
            };
        }        
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
        case SÍN:
            return "#424242";
        case VASUTAUTO:
            return "#a27048";
        case VASUTZEBRA:
            return "#FFFFFF";
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
    GAME.canvasContext.fill();
}

function drawDirectionArrow(pos,direction){
    GAME.canvasContext.fillStyle = "#FFFF00";
    fromx = Number(pos.x)*GAME.mapRatio;
    fromy = Number(pos.y)*GAME.mapRatio;
    tox = GAME.mapRatio*normals[direction].x + fromx;
    toy = GAME.mapRatio*normals[direction].y + fromy;
   
    canvas_arrow(GAME.canvasContext, fromx + 0.5*GAME.mapRatio, fromy + 0.5*GAME.mapRatio, tox + 0.5*GAME.mapRatio, toy + 0.5*GAME.mapRatio, 0.5*GAME.mapRatio);
}



