window.GAME = {
    gameMatrix:[],
    width:0,
    height:0,
    mapRatio:10,
    canvasContext:undefined,
    pathFinder:undefined,
    graph:createGraph(),
    myCarId: undefined,
    myCar: undefined,
    myPassengerId: undefined,
    myPassenger: undefined,
    lastLife: undefined,
    lastTickData: undefined
};

var POLL = false;
const ASZFALT = "S", ZEBRA = "Z", JÁRDA = "P",FŰ = "G", ÉPÜLET = "B", FA = "T", SÍN="R", VASUTZEBRA="C", VASUTAUTO="X";
const mapstr = "GPSSPRGGGGGTTTGGGGGGTTTGTTGGGGGGTTTGTGGGGGGGTTGGGGGGGGRPSSPG#PPSSPCPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPCPSSPP#SSSSSXSSSSSSSSSSSSSSSSSSSSSSZSSZSSSSSSSSSSSSSSSSSSSSSSXSSSSS#SSSSSXSSSSSSSSSSSSSSSSSSSSSSZSSZSSSSSSSSSSSSSSSSSSSSSSXSSSSS#PPSSPCPZZPPPPPPPPPPPPPPPPPPPPSSPPPPPPPPPPPPPPPPPPPPZZPCPSSPP#RCXXCRCXXCRRRRRRRRRRRRRRRRRRCXXCRRRRRRRRRRRRRRRRRRCXXCRCXXCR#TPSSPRPSSPPPPPPPPPPPPPPPPPPPPSSPPPPPPPPPPPPPPPPPPPPSSPRPSSPG#TPSSPRPSSSSSSSSZSSZSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSPRPSSPG#GPSSPRPSSSSSSSSZSSZSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSPRPSSPT#TPSSPRPSSPPPPPPPSSPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPSSPRPSSPG#TPSSPRPSSSPPTBBPSSPGTGGGBBBBBGPPPPPPPPGTBBBBBBGBBPSSSPRPSSPG#GPSSPRPSSSSPPTBPSSPTTTPPPPPPPPPSSSSSSPPPBBBBBBGBBPSGSPRPSSPT#GPSSPRPPSSSSPPTPSSPGTGPSSSSSSSSSSSSSSSSPPPGTTPPPPPSGSPRPSSPT#GPSSPRGPPSSSSPPPSSPPBBPSSSSSSSSSSPPSSSSSSPPPGPSSSSSGSPRPSSPG#TPSSPRGGPPSSSSPSSSSPPPPSSPSSPPSSPPPPPSSSSSSPPPSSSSSSSPRPSSPG#TPSSPRGGGPPSSSSSBBSSSSSSSSSSPPSSSSSSPPPSSSSSSZSSPPPPPPRPSSPT#GPSSPRGGGGPPSSSSBBSSSSSSSSSSPPSPPPPSSSPPPSSSSZSSPPSSPGRPSSPT#TPSSPRGGGGGPPPPSSSSPPPPPPPPPPPSPPSSSSSSPPPPPPPSSPPSSPTRPSSPG#GPSSPRGGGGGGGGPPSSPPSSSSSSSSGPSSSSPPSSSSPPGTGPSSSSSSPTRPSSPG#GPSSPRGGGGGBBBGPSSSSSSSSSSSSSPPPPPPPPSSSSPPGPPSSSSSSPTRPSSPG#GPSSPRGGGGGBBBGPSSSSSSPPPPSSSSSSSSSSPPSSSSPPPSSSPPPPPTRPSSPT#GPSSPRGGGGGBBBGPSSPPPPPGGPPSSSSSSSSSSPPSSSSPSSSSPBBBBTRPSSPG#GPSSPRPPPPPPPPPPSSPGGTTTTTPPPPPPPPSSSSPPSSSSSSSPPBBBBBRPSSPG#GPSSPRPSSSSSSSSSSSPGGTGGGTTTTGBBGPPSSSSPPSSSSSPPGGGGGTRPSSPG#TPSSPRPSSSSSSSSSSSPGGTTBGTTTTTBBTGPPSSSSPPPPSSSPPPPPPTRPSSPG#TPSSPRPSSPPPPPPPSSPGGTTGGTTGGTGTTTGPPSSSSSSPSSSSSSSSPGRPSSPT#TPSSPRPSSPBGBBBPSSPGGTTGTTTGGPPPPTGGPPSSSSSPPSSSSSSSPGRPSSPT#TPSSPRPSSPBGBBBPSSPGGGGGGGGGPPSSPPGGGPPPPPPPPPPPPPZZPPRPSSPG#GPZZPCPZZPPPPPPPSSPPPPPPPPPPPSSSSPPPPPPPPPPPPPPPPSSSSPCPZZPG#GPSSSXSSSSSSSSSSSSSSSSSSSSSSSSBBSSSSSSSSSSSSSSSSSSBBSSXSSSPT#GPSSSXSSSSSSSSSSSSSSSSSSSSSSSSBBSSSSSSSSSSSSSSSSSSBBSSXSSSPT#GPZZPCPPPPPPPPPPPPPPSSPPPPPPPSSSSPPPPPPPSSPPPPPPPSSSSPCPZZPG#GPSSPRPSSSSPPBBBBPPSSSPGGPPPPPSSPPPPPGGPSSSPPGBBPPSSPPRPSSPT#TPSSPRPSSSSSPBBBBPSSSSPBBPSSSSSSSSSSPGGPSSSSPGBBGPSSPTRPSSPT#TPSSPRPPPSSSPGGGGPSSSPPGGPSSSSSSSSSSPGTPPSSSPTGTGPSSPTRPSSPG#TPSSPRTTPPSSPGTTGPSSPPTTGPSSPPPPPPSSPGTGPPSSPGTTGPSSPTRPSSPG#GPSSPRGBBPSSPGTTTPSSPGTTBPSSPGGGTPSSPGTTGPSSPGTTTPSSPGRPSSPG#GPSSPRGBBPSSPGTTTPSSPGBBBPSSPGGTTPSSPGGGGPSSPGGTTPSSPGRPSSPG#TPSSPRPPPPSSPPPPPPZZPPPPPPZZPPPPPPSSPPPPPPZZPPPPPPZZPPRPSSPG#TPSSPRPSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSZSSZSSSSSSSSPRPSSPG#GPSSPRPSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSZSSZSSSSSSSSPRPSSPG#GPSSPRPSSPPPPPSSPPPPPPPPPPPPZZPPPPPZZPPPPPSSPPPPPSSPPPRPSSPG#GPSSPRPSSPTTGPSSPGGGTTTGBBBPSSPGTTPSSPBBGPSSPGBBPSSPBGRPSSPT#GPSSPRPSSPGGGPSSPGGGGTTGBBBPSSPGTGPSSPBBTPSSPTBBPSSPBTRPSSPT#GPSSPRPSSPPPPPZZPPPPPPPPPPPPSSPPPPPSSPPPPPSSPPPPPSSPPGRPSSPG#GPSSPRPSSSSSSZSSZSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSPGRPSSPG#GPSSPRPSSSSSSZSSZSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSPTRPSSPT#TPSSPRPPSSPPPPZZPPPPSSPPPPZZPPPPSSPPPPPPPPPPSSPPPPZZPTRPSSPG#TPSSPRGPSSPBBPSSPBBPSSPGBPSSPBGPSSPGTTTGGGGPSSPGTPSSPGRPSSPT#TPSSPRGPSSPBBPSSPBBPSSPBBPSSPBGPSSPTTTTGTTGPSSPGGPSSPGRPSSPG#GPSSPRGPSSPPPPSSPPPPZZPPPPSSPPPPZZPPPPPPPPPPZZPPPPSSPTRPSSPT#GPSSPRTPSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSPPPGRPSSPG#GPSSPRTPSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSPGGTRPSSPG#GPSSPRTPPPPPPPPPPPPPPPPPPPPPPSSPPPPPPPPPPPPPPPPPPPPGTTRPSSPG#RCXXCRRRRRRRRRRRRRRRRRRRRRRRCXXCRRRRRRRRRRRRRRRRRRRRRRRCXXCR#PPSSPCPPPPPPPPPPPPPPPPPPPPPPPSSPPPPPPPPPPPPPPPPPPPPPPPCPSSPP#SSSSZXSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSXZSSSS#SSSSZXSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSXZSSSS#PPSSPCPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPCPSSPP#GPSSPRGGGGTTGGGTGGGGGGTTGGGGGGGGGGGTTGGGGGTGGTTGGGTTGGRPSSPG";
function pollThickFromServer(){
    let repeatAfterDelay = function(){        
        if(!POLL){
            return;
        }
        var delay = document.getElementById("stepdelay").value;
        setTimeout(pollThickFromServer,delay);
    }
    $.ajax({
        url: 'wait_for_thick',
        type: 'GET',
        success: function(data){
            if(data.end){
                refreshOldGames();
                console.log("Game finished!");
                stopGame();
                return;
            }

            if(data.thick){
                GAME.myCarId = data.thick.request_id.car_id;
                GAME.myCar = data.thick.cars.find(function(c) {return c.id === GAME.myCarId});
            }
            
            // console.log("---------LÉPÉS "+data.thick.request_id.tick+" -----------");
            // console.log(data.thick.cars[0]);
            // console.log(data.sent);
            // console.log(data.info);
            repeatAfterDelay();
            drawMap(data.thick,data.sent.command,data.info.route);
            window.steps.push(data);

            /**
             * Test car collision logic
             */
            // if (GAME.myCar && data.thick){
            //     var danger = CollisionDetector.isDanger(GAME.myCar, data.thick);
            //     if(danger){
            //         console.error("Danger:\n");
            //         console.error(danger);
            //     }
            // }
            // if(GAME.myCar && data.thick){
            //     if(!GAME.lastLife){
            //         GAME.lastLife = GAME.myCar.life;
            //         if(!GAME.lastTickData){
            //             GAME.lastTickData = data.thick;
            //         }
            //     }else if(GAME.myCar.life != GAME.lastLife){
            //         GAME.lastLife = GAME.myCar.life;
            //         var dangerl = CollisionDetector.isDanger(GAME.myCarId, GAME.lastTickData)
            //         var danger = CollisionDetector.isDanger(GAME.myCarId, data.thick);
            //         console.error("Life point was lost!\nLast tick: ",
            //                       GAME.lastTickData,
            //                       "\nTick:",
            //                       data.thick,
            //                       "\nCollisionDetector Result For last tick:",
            //                       dangerl,
            //                       "\nCollisionDetector Result For this tick:",
            //                       danger);
            //     }
            // }
            // GAME.lastTickData = data.thick;
        },
        error: function(data) {            
            console.error("Game finished with error!",data);            
            refreshOldGames();
            stopGame();
        }
    });
}

function stopGame(){
    POLL = false;    
    document.getElementById("startorstop").innerHTML = "START";
}

function startOrStop(){    
    
    if(!POLL){
        document.getElementById("startorstop").innerHTML = "STOP";
        POLL = true;
        window.steps = [];
        pollThickFromServer();        
    }else{
       stopGame(); 
    }  
    $.ajax({
        url: 'startorstop',
        type: 'POST',
        data:JSON.stringify({
            gameMatrix:GAME.gameMatrix
        }),
        contentType: "application/json; charset=utf-8",
        dataType: "json",
        success: function(data){            
            console.log(data)
        },
        error: function(data) {
            
        }
    });
}

var mapRows = mapstr.split("#");
GAME.width = mapRows[0].length;
GAME.height = mapRows.length;
for(var i = 0; i < mapRows.length; i++){
    let row = mapRows[i];
    GAME.gameMatrix[i] = [];
    for(var j = 0; j < row.length; j++){        
        GAME.gameMatrix[i].push(row[j]);
    }
}


$( document ).ready(function() {
    refreshOldGames();    
    mapSizeChanged(10);
    drawMap();
});

function refreshOldGames(){
    document.getElementById("oldlistcontainer").innerHTML = '<table id="oldlist" style="width: 100%;"><tr><th>GameId</th><th>transported</th><th></th></tr></table>';
    $.ajax({
        url: 'loadGames',
        type: 'GET',
        dataType: "json",
        success: function(data){                        
            data.forEach(game => {               
                createGameDiv(game);
            });
        },
        error: function(data) {
            
        }
    });
}

function createGameDiv(game){
    var container = document.createElement("tr");
    var id = document.createElement("td");
    if(game[0].thick){
        id.innerHTML = game[0].thick.request_id.game_id;
    }
    
    container.appendChild(id);    
    var points = document.createElement("td");
    if(game[0].thick){
        var mycar = game[game.length-1].thick.cars.find(function(c) {return c.id === game[0].thick.request_id.car_id});  
       points.innerHTML = mycar.transported;
    }
    container.appendChild(points);
    
    var playtd = document.createElement("td");
    var load = document.createElement("button");
    load.innerHTML="Elindít";
    playtd.appendChild(load);
    load.addEventListener("click",function(){
        if(game.running){
            game.running = false;
        }else{
            game.running = true;
            replayNext(game);
        }        
    });
    container.appendChild(playtd);

    document.getElementById("oldlist").appendChild(container);
}

function replayNext(game){
    let datas = game.shift();
    drawMap(datas.thick,datas.step.command);
    if(game.length > 0){
        setTimeout(function(){
            if(!game.running){
                return;
            }
            replayNext(game);
        },document.getElementById("stepdelay").value);
    }else{
        game.running = false;
    }
}
