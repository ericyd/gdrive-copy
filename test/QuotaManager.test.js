import QuotaManager from '../lib/QuotaManager';
import Timer from '../lib/Timer';
import PropertiesService from './mocks/PropertiesService';
import * as sinon from 'sinon';
import * as assert from 'assert';

describe('QuotaManager', function() {
  beforeEach(function() {
    this.start = new Date().getTime();
    this.clock = sinon.useFakeTimers(this.start);
    this.timer = new Timer();
    this.userProperties = PropertiesService.getUserProperties();
    this.quotaManager = new QuotaManager(this.timer, this.userProperties);
  });

  afterEach(function() {
    this.clock.restore();
  });

  it('should update stop property if userProperties.stop is true', function() {
    this.userProperties.getProperties().stop = false;
    this.quotaManager.update();
    assert.ok(
      this.quotaManager.canContinue(),
      'stopped when stop flag is false'
    );

    this.userProperties.getProperties().stop = 'true';
    this.quotaManager.update();
    assert.ok(
      !this.quotaManager.canContinue(),
      'did not stop when stop flag is true'
    );

    // reset stop flag
    this.userProperties.getProperties().stop = false;
  });
});
