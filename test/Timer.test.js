const Timer = require('../lib/Timer');
var assert = require('chai').assert;

describe('timers', function() {
  beforeEach(function() {
    this.timer = new Timer();
  });

  describe('timers.START_TIME', function() {

    it('should update when initialized', function() {
      assert.notEqual(this.timer.START_TIME, 0);
    });
  });

  describe('timers.timeIsUp', function() {
    it('should begin as false', function() {
      assert.equal(this.timer.timeIsUp, false);
    });
    it('should be false when currTime is less than 4.7 minutes after START_TIME', function() {
      assert.equal(this.timer.timeIsUp, false);
      this.timer.currTime = this.timer.START_TIME + 4.6 * 1000 * 60;
      assert.equal(this.timer.timeIsUp, false);
    });

    it('should be true when currTime is greater than 4.7 minutes after START_TIME', function() {
      assert.equal(this.timer.timeIsUp, false);
      this.timer.currTime = this.timer.START_TIME + 4.8 * 1000 * 60;
      assert.isAtLeast(
        this.timer.currTime - this.timer.START_TIME, this.timer.MAX_RUNNING_TIME
      );
    });
  });
});
