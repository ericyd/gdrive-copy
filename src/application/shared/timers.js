// {boolean} timeIsUp - true if max execution time is reached while executing script
// {number} currTime, - integer representing current time in milliseconds
// {boolean} stop - true if the user has clicked the 'stop' button
var timers = {
    'START_TIME': 0,
    'MAX_RUNNING_TIME': 4.7 * 1000 * 60,
    'currTime': 0,
    'timeIsUp': false,
    'stop': false, 
    'initialize': function() {
        this.START_TIME = (new Date()).getTime(); 
    },
    'update': function(userProperties) {
        this.currTime = (new Date()).getTime();
        this.timeIsUp = (this.currTime - this.START_TIME >= this.MAX_RUNNING_TIME);
        this.stop = userProperties.getProperties().stop == 'true';
    }
}