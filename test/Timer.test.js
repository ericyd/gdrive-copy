import Timer from '../lib/Timer';
import Properties from '../lib/Properties';
import QuotaManager from '../lib/QuotaManager';
const assert = require('assert');
const sinon = require('sinon');
const PropertiesService = require('./mocks/PropertiesService');

describe('timers', function() {
  beforeEach(function() {
    this.now = new Date().getTime();
    this.clock = sinon.useFakeTimers(this.now);
    this.timer = new Timer();
    this.userProperties = PropertiesService.getUserProperties();
    this.quotaManager = new QuotaManager(this.timer, this.userProperties);
  });
  afterEach(function() {
    this.clock.restore();
  });

  describe('START_TIME property', function() {
    it('should update when initialized', function() {
      assert.equal(this.timer.START_TIME, this.now);
    });
  });

  describe('timeIsUp()', function() {
    it('should begin as false', function() {
      assert.equal(this.timer.timeIsUp, false);
    });
    it('should be false when currTime is less than 4.7 minutes after START_TIME', function() {
      assert.equal(this.timer.timeIsUp, false);
      this.clock.tick(4.6 * 1000 * 60);
      this.quotaManager.update();
      assert.equal(this.timer.timeIsUp, false);
      assert(this.timer.canContinue(), 'timer should be able to continue');
    });

    it('should be true when runtime is greater than 4.7 minutes after START_TIME', function() {
      assert.equal(this.timer.timeIsUp, false);
      this.clock.tick(4.8 * 1000 * 60);
      this.quotaManager.update();
      assert(
        this.timer.runtime >= Timer.MAX_RUNTIME,
        'runtime not >= max runtime'
      );
      assert(!this.timer.canContinue(), 'timer should not be able to continue');
    });
  });

  it('should give trigger duration of 6 mins when under max runtime per day', function() {
    const properties = new Properties();
    properties.incrementTotalRuntime(10);
    const duration = this.timer.calculateTriggerDuration(properties);
    assert.equal(
      duration,
      Timer.sixMinutes,
      'duration not equal to six minutes'
    );
  });

  it('should subtract current runtime from duration', function() {
    const properties = new Properties();
    properties.incrementTotalRuntime(10);
    const runtime = 1000;
    this.timer.runtime = runtime;
    const duration = this.timer.calculateTriggerDuration(properties);
    assert.equal(
      duration,
      Timer.sixMinutes - runtime,
      'duration not equal to six minutes'
    );
  });

  it('should give trigger duration of 24 hours when over max runtime per day', function() {
    const properties = new Properties();
    properties.incrementTotalRuntime(Timer.MAX_RUNTIME_PER_DAY);
    const duration = this.timer.calculateTriggerDuration(properties);
    assert.equal(duration, Timer.oneDay, 'duration not equal to one day');
  });
});
