/**********************************************
 * Tracks runtime of application to avoid
 * exceeding Google quotas
 **********************************************/

function Timer() {
  this.START_TIME = new Date().getTime();
  this.MAX_RUNNING_TIME = 4.7 * 1000 * 60;
  this.currTime = 0;
  this.timeIsUp = false;
  this.stop = false;

  return this;
}

/**
 * Update current time
 * @param {UserPropertiesService} userProperties
 */
Timer.prototype.update = function(userProperties) {
  this.currTime = new Date().getTime();
  this.timeIsUp = this.currTime - this.START_TIME >= this.MAX_RUNNING_TIME;
  this.stop = userProperties.getProperties().stop == 'true';
};

/**
 * @returns {boolean}
 */
Timer.prototype.canContinue = function() {
  return !this.timeIsUp && !this.stop;
};
