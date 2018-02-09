function Timer() {
  this.START_TIME = 0;
  this.MAX_RUNNING_TIME = 4.7 * 1000 * 60;
  this.currTime = 0;
  this.timeIsUp = false;
  this.stop = false;

  return this;
}

Timer.prototype.initialize = function() {
  this.START_TIME = new Date().getTime();
}

/**
 * Update current time
 * @param {UserPropertiesService} userProperties 
 */
Timer.prototype.update = function(userProperties) {
  this.currTime = new Date().getTime();
  this.timeIsUp = this.currTime - this.START_TIME >= this.MAX_RUNNING_TIME;
  this.stop = userProperties.getProperties().stop == 'true';
}

/**
 * @returns {boolean}
 */
Timer.prototype.canContinue = function() {
  return !this.timeIsUp && !this.stop;
}