function pollThickFromServer(){
    let repeatAfterDelay = function(){
        setTimeout(pollThickFromServer,1000);
    }
    $.ajax({
        url: 'wait_for_thick',
        type: 'GET',
        success: function(data){
            repeatAfterDelay();
        },
        error: function(data) {
            repeatAfterDelay();
        }
    });
}

pollThickFromServer();