var fs = require('fs');
var base = '/Users/nagydaniel/Documents/Munka/asseco/coding_cup/logs/'
var files = ['status_log_12925', 'status_log_12928', 'status_log_12934', 'status_log_12939', 'status_log_12944',
             'status_log_12955', 'status_log_12964', 'status_log_12966', 'status_log_12973', 'status_log_13086'];

function isEqualByFields(a, b, fields){
    if (!fields){
        fields = Object.keys(a);
    }
    for(let field of fields){
        if (JSON.stringify(a[field]) != JSON.stringify(b[field])){
            return false;
        }
    }
    return true;
}

function copyWithFields(a, fields){
    if (!fields){
        fields = Object.keys(a);
    }
    var o = {};
    for(let field of fields){
        o[field] = JSON.parse(JSON.stringify(a[field]));
    }
    return o;
}
function filterForLifeLosses(data){
    if(data.length < 2){
        return;
    }
    var filtered = [];
    for(var k = 0; k<data.length-1; k++){
        if (data[k].life>data[k+1].life){
            filtered.push(data[k]);
        }
    }
    return filtered;
}

function filterForLifeLosses2Tick(data){
    if(data.length < 3){
        return;
    }
    var filtered = [];
    for(var k = 0; k<data.length-2; k++){
        if (data[k].life==data[k+1].life && data[k+1].life>data[k+2].life){
            filtered.push(data[k]);
        }
    }
    return filtered;
}


var filtered_1 = [];
var filtered_2 = [];

var counts_1 = [];
var counts_2 = [];

for(const file of files){
    var data = JSON.parse(fs.readFileSync(base+file));
    filtered_1=filtered_1.concat(filterForLifeLosses(data));
    filtered_2=filtered_2.concat(filterForLifeLosses2Tick(data));
}

for(const entry of filtered_1){
    var obj = copyWithFields(entry);
    //var key = JSON.stringify(obj)
    var k=0;
    for(; k<counts_1.length; k++){
        if (counts_1[k].entry && isEqualByFields(counts_1[k].entry, obj)) {
            counts_1[k].value = 1 + (counts_1[k].value || 0);
            break;
        }
    }
    if (k==counts_1.length){
        counts_1.push({
            entry: obj,
            value: 1
        });
    }
}

for(const entry of filtered_2){
    var obj = copyWithFields(entry);
    //var key = JSON.stringify(obj)
    var k=0;
    for(; k<counts_2.length; k++){
        if (counts_2[k].entry && isEqualByFields(counts_2[k].entry, obj)) {
            counts_2[k].value = 1 + (counts_2[k].value || 0);
            break;
        }
    }
    if (k==counts_2.length){
        counts_2.push({
            entry: obj,
            value: 1
        });
    }
}

// for(const entry of filtered_2){
//     var obj = copyWithFields(entry);
//     var key = JSON.stringify(obj)
//     counts_2[key]['value'] = 1 + (counts_2[key]['value'] || 0);
// }

var f1File = base+'car_crash_stats';
var f2File = base+'car_crash_stats_2tick';
fs.writeFileSync(f1File, JSON.stringify(filtered_1));
fs.writeFileSync(f2File, JSON.stringify(filtered_2));

var c1File = base+'crash_stats_unique';
var c2File = base+'crash_stats_unique_2tick';
fs.writeFileSync(c1File, JSON.stringify(counts_1.sort((a,b) => {return a.value - b.value; })));
fs.writeFileSync(c2File, JSON.stringify(counts_2.sort((a,b) => {return a.value - b.value; })));


