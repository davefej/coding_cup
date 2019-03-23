const ASZFALT = "S", ZEBRA = "Z", JÁRDA = "P",FŰ = "G", ÉPÜLET = "B", FA = "T";
module.exports  = {

    calculateNextStep(thickData){
        return {
            command:"valami",
            thick:thickData.thick
        }
    },
    setMap(map){
        this.map = map;
    },
    firstMessage(){
        return {
            token:"1234"
        };
    }
};
let i = 0;