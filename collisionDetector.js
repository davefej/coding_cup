const fields = [
    "         ",
    "   XXX   ",
    "   XXX   ",
    "   XXX   ",
    "   XXXX  ",
    "  XXXXX  ",
    " XXXXXXX ",
    " XXXXXXX ",
    " XXXCXXX ",
    "  XXXXX  ",
    "   XXX   ",
    "    X    ",
    "         "];

function relativeCoordsFromFields(){
    carCoords = []
    seenCoords = []
    for (var y=0; y < fields.length; ++y){
        var line = fields[y];
        for(var x=0; x < line.length; ++x){
            if (fields[y][x] == 'C'){
                carCoords = [x, y]
            }
            if (fields[y][x] ==  'X'){
                seenCoords.push([x, y])
            }
        }
    }
    relativeSeenCoords = []
    for(var k in seenCoords){
        relativeSeenCoords.push([seenCoords[k][0]-carCoords[0], seenCoords[k][1]-carCoords[1]])
    }
    return relativeSeenCoords;
}

function rmatrix(phi){
    return [Math.cos(phi), -Math.sin(phi)], [Math.sin(phi), Math.cos(phi)]
}
function dot(mat22, vec2){
    return [[mat22[0][0]*vec2[0] + mat22[0][1]*vec2[1]], [mat22[1][0]*vec2[0] + mat22[1][1]*vec2[1]]]
}

function transformedSeenCoords(dir) {
    
    originalCoords =  relativeCoordsFromFields();
    switch(dir){
        case '^': {
            return originalCoords;
        }
        case '<': {
            rotated = []
            R = rmatrix(Math.PI/2.0)
            for(var k in originalCoords){
                rotated.push(dot(R, originalCoords[k]))
            }
            return rotated
        }
        case '>': {
            rotated = []
            R = rmatrix(-Math.PI/2.0)
            for(var k in originalCoords){
                rotated.push(dot(R, originalCoords[k]))
            }
            return rotated
        }
        case 'v': {
            rotated = []
            R = rmatrix(Math.PI)
            for(var k in originalCoords){
                rotated.push(dot(R, originalCoords[k]))
            }
            return rotated
        }
    }
};

module.exports = {
    isSeen(tick){

    }
    detect: function(tick){

    }
};