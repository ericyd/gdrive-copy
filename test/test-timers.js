var assert = require('chai').assert;
var timers = {
  START_TIME: 0,
  MAX_RUNNING_TIME: 4.7 * 1000 * 60,
  currTime: 0,
  timeIsUp: false,
  stop: false,
  initialize: function() {
    this.START_TIME = new Date().getTime();
  },
  update: function(userProperties) {
    this.currTime = new Date().getTime();
    this.timeIsUp = this.currTime - this.START_TIME >= this.MAX_RUNNING_TIME;
    //this.stop = userProperties.getProperties().stop == 'true';
  }
};

describe('timers', function() {
  describe('timers.START_TIME', function() {
    it('should update when initialized', function() {
      timers.initialize();
      assert.notEqual(timers.START_TIME, 0);
    });
  });

  describe('timers.timeIsUp', function() {
    it('should begin as false', function() {
      assert.equal(timers.timeIsUp, false);
      timers.initialize();
      assert.equal(timers.timeIsUp, false);
    });
    it('should be false when currTime is less than 4.7 minutes after START_TIME', function() {
      timers.initialize();
      timers.update();
      assert.equal(timers.timeIsUp, false);
      timers.currTime = timers.START_TIME + 4.6 * 1000 * 60;
      assert.equal(timers.timeIsUp, false);
    });

    it('should be true when currTime is greater than 4.7 minutes after START_TIME', function() {
      timers.initialize();
      timers.update();
      assert.equal(timers.timeIsUp, false);
      timers.currTime = timers.START_TIME + 4.8 * 1000 * 60;
      assert.equal(
        timers.currTime - timers.START_TIME >= timers.MAX_RUNNING_TIME,
        true
      );
    });
  });
});
