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

// Max runtime per day is 90 minutes. Set max as 85 mins for padding.
// https://developers.google.com/apps-script/guides/services/quotas
Timer.MAX_RUNTIME_PER_DAY = 85 * 1000 * 60;
// durations used for setting Triggers
Timer.oneDay = 24 * 60 * 60 * 1000;
Timer.sixMinutes = 6.2 * 1000 * 60;

/**
 * Update current time
 * @param {UserPropertiesService} userProperties
 */
Timer.prototype.update = function(userProperties) {
  this.currTime = new Date().getTime();
  this.timeIsUp = this.currTime - this.START_TIME >= this.MAX_RUNNING_TIME;
  this.stop = userProperties.getProperty('stop') == 'true';
};

/**
 * @returns {boolean}
 */
Timer.prototype.canContinue = function() {
  return !this.timeIsUp && !this.stop;
};

//removeIf(production)
// Google Apps Script doesn't play well with module.exports,
// but it is required for testing
module.exports = Timer;
//endRemoveIf(production)
