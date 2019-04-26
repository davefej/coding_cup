[1mdiff --git a/driver.js b/driver.js[m
[1mindex 9027fcd..fbbf9ee 100644[m
[1m--- a/driver.js[m
[1m+++ b/driver.js[m
[36m@@ -5,7 +5,7 @@[m [mFULL_THROTTLE = "FULL_THROTTLE";EMERGENCY_BRAKE = "EMERGENCY_BRAKE"; GO_LEFT = "[m
 [m
 const FREE = 1, HASPASSENGER = 2, GOINGFORPASSENGER = 3, WAITINGIN = 4,WAITINGOUT =5;[m
 var routePoints, car, state = FREE, currentPassenger, waze,stepLog;[m
[31m-[m
[32m+[m[32mvar teleporting = false;[m
 module.exports = {[m
     setPathFinder(pathFinder){[m
         waze = pathFinder;[m
[36m@@ -109,6 +109,7 @@[m [mmodule.exports = {[m
         }[m
         if(isSamepos(futureCar.pos,routePoints[0])){[m
             routePoints.shift();[m
[32m+[m[32m            teleporting = false;[m
         }[m
         var toNode = routePoints[0];[m
         var nextNode = routePoints[1];        [m
[36m@@ -121,6 +122,9 @@[m [mmodule.exports = {[m
             return DECELERATION;                [m
         }[m
         var distanceToNode = calcPointsDistance(futureCar.pos,toNode);[m
[32m+[m[32m        if(isTeleportRoute(futureCar.pos,toNode)){[m
[32m+[m[32m            teleporting = true;[m
[32m+[m[32m        }[m
         var directionToNode = calculateDirection(futureCar.pos,toNode);[m
         var nextNodesDirection = calculateDirection(toNode,nextNode);[m
 [m
[36m@@ -207,18 +211,7 @@[m [mmodule.exports = {[m
     }[m
 };[m
 [m
[31m-function isMagicPoints(point1,point2){[m
[31m-    return isMagicPoint(point1) && isMagicPoint(point2);[m
[31m-}[m
 [m
[31m-function isMagicPoint(point){[m
[31m-    if(point.x == 2 || point.x == 3 || point.x == 56 || point.x == 57){[m
[31m-        if(point.y == 2 || point.y == 3 || point.y == 56 || point.y == 57){[m
[31m-            return true;[m
[31m-        }[m
[31m-    }[m
[31m-    return false;[m
[31m-}[m
 [m
 function isSamepos(pos1,pos2){[m
     try{[m
[36m@@ -265,7 +258,7 @@[m [mfunction calculateDirection(from,to){[m
     };[m
 [m
 [m
[31m-    /*if(isMagicPoints(from,to)){[m
[32m+[m[32m    if(isTeleportRoute(from,to) || (isMagicPoint(to) && teleporting == true)){[m
         console.log("Magic Point direction",from,to);[m
         if(from.x > to.x){[m
             return RIGHT;[m
[36m@@ -276,8 +269,7 @@[m [mfunction calculateDirection(from,to){[m
         }else if(from.y > to.y){[m
             return DOWN;[m
         }    [m
[31m-    }*/[m
[31m-[m
[32m+[m[32m    }[m
 [m
     if(from.x > to.x){[m
         return LEFT;[m
[36m@@ -295,12 +287,11 @@[m [mfunction calculateDirection(from,to){[m
 function calcPointsDistance(a,b){[m
     a = normalizePoint(a);[m
     b = normalizePoint(b);[m
[31m-    if(isMagicPoints(a,b)){[m
[32m+[m[32m    if(isTeleportRoute(a,b)){[m
         return Math.min( 60 - (Math.abs(a.x-b.x) + Math.abs(a.y-b.y)),Math.abs(a.x-b.x) + Math.abs(a.y-b.y));[m
     }else{[m
         return Math.abs(a.x-b.x) + Math.abs(a.y-b.y);[m
[31m-    }[m
[31m-    [m
[32m+[m[32m    }[m[41m    [m
 }[m
 [m
 [m
[1mdiff --git a/public/common.js b/public/common.js[m
[1mindex ce60de0..c4ed185 100644[m
[1m--- a/public/common.js[m
[1m+++ b/public/common.js[m
[36m@@ -10,7 +10,7 @@[m [mbuildGraph = function(){[m
     graphBuilder_R();[m
     addRotations();[m
 [m
[31m-    addJardaPoints();[m
[32m+[m[32m    //addJardaPoints();[m
 [m
 [m
     pathFinder = ngraphPath.aStar(graph, {[m
[36m@@ -100,6 +100,11 @@[m [misJarda = function(point){[m
 }[m
 [m
 calcWeight = function(from,dest,distance){[m
[32m+[m[41m     [m
[32m+[m[32m    if(isTeleportRoute(from,dest)){[m
[32m+[m[32m        return 60-distance;[m
[32m+[m[32m    }[m
[32m+[m
     if(distance > 5){[m
         return 5 + Math.floor((distance-5) / 2);[m
     }else{[m
[36m@@ -108,6 +113,24 @@[m [mcalcWeight = function(from,dest,distance){[m
 }[m
 [m
 [m
[32m+[m[32misMagicPoints = function(point1,point2){[m
[32m+[m[32m    return isMagicPoint(point1) && isMagicPoint(point2);[m
[32m+[m[32m}[m
[32m+[m
[32m+[m[32misTeleportRoute = function(from,to){[m
[32m+[m[32m    var distance =  Math.abs(from.x-to.x) + Math.abs(from.y-to.y);[m
[32m+[m[32m    return isMagicPoints(from,to) && (distance > 3);[m
[32m+[m[32m}[m
[32m+[m
[32m+[m[32misMagicPoint = function(point){[m
[32m+[m[32m    if(point.x == 2 || point.x == 3 || point.x == 56 || point.x == 57){[m
[32m+[m[32m        if(point.y == 2 || point.y == 3 || point.y == 56 || point.y == 57){[m
[32m+[m[32m            return true;[m
[32m+[m[32m        }[m
[32m+[m[32m    }[m
[32m+[m[32m    return false;[m
[32m+[m[32m}[m
[32m+[m
 normalizePoint = function(point){[m
     if(typeof point.i == "undefined"){[m
         point.i = point.y[m
