const ASZFALT = "S", ZEBRA = "Z", JÁRDA = "P",FŰ = "G", ÉPÜLET = "B", FA = "T";
module.exports  = {

    calculateNextStep(thickData){
        return {
            "response_id": {
              "game_id": thickData.request_id.game_id,
              "tick":thickData.request_id.tick,
              "car_id": thickData.request_id.car_id
            },
            command:"+"
        }
    },
    setMap(map){
        this.map = map;
    },
    firstMessage(){
        return {
            token:"1iVXOVZK7ldH5Kr6qYCEkZE6xpR0SXZJkyfQayrKfJ2e9S8xdeTjsV9oohjePSsUXFOcDnevsu918"
        };
    }
};
let i = 0;