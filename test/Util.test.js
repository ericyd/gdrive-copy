global.Utilities = require('./mocks/Utilities');
import { Util } from '../lib/Util';
import Logging from '../lib/util/Logging';
import Timer from '../lib/Timer';
import TriggerService from '../lib/TriggerService';
import Properties from '../lib/Properties';
import Constants from '../lib/Constants';
import QuotaManager from '../lib/QuotaManager';
const userProperties = require('./mocks/PropertiesService').getUserProperties();
const sinon = require('sinon');
const assert = require('assert');

describe('Util', function() {
  describe('exponentialBackoff()', function() {
    it('should retry 6 times on failure', function() {
      // set up mocks
      const errMsg = 'i failed';
      const failingFunc = sinon.stub().throws(errMsg);
      Logging.log = sinon.stub();

      const failingFunc2 = () => {
        throw new Error(errMsg);
      };

      // set up actual
      try {
        Util.exponentialBackoff(failingFunc, 'failure message');
      } catch (e) {}

      // assertions
      assert.equal(failingFunc.callCount, 6, 'failing func not called 6 times');
      assert.equal(Logging.log.callCount, 7, 'Logging.log not called 7 times');
    });
    it('should rethrow error after 6 tries', function() {
      // set up mocks
      const errMsg = 'i failed';
      const Logging = { log: sinon.stub() };
      const failingFunc2 = () => {
        throw new Error(errMsg);
      };

      // set up actual and assert
      assert.throws(
        () => {
          Util.exponentialBackoff(failingFunc, 'failure message');
        },
        Error,
        'threw wrong error after 6 attempts'
      );
    });
  });
  describe('cleanup()', function() {
    beforeEach(function() {
      this.clock = sinon.useFakeTimers();
    });
    afterEach(function() {
      this.clock.restore();
    });
    it('should set the "stop message" based on passed arguments', function() {
      // set up mocks
      const stubSaveState = sinon.stub(Util, 'saveState');
      const stubDeleteTrigger = sinon.stub(TriggerService, 'deleteTrigger');
      const timer = new Timer();
      const quotaManager = new QuotaManager(timer, userProperties);
      this.clock.tick(Timer.sixMinutes);
      quotaManager.update();
      const fileList = [{ id: 1 }, { id: 2 }, { id: 3 }];
      const properties = new Properties();

      // scenarios

      // normal pause
      let stopMsg = Constants.SingleRunExceeded;
      Util.cleanup(
        properties,
        fileList,
        userProperties,
        timer,
        quotaManager,
        {}
      );
      assert(stubSaveState.calledOnce, 'saveState not called');
      assert.equal(
        stubSaveState.getCall(0).args[2],
        stopMsg,
        'saveState called with wrong stopMsg 1'
      );

      // user set stop flag
      userProperties.setProperty('stop', 'true');
      quotaManager.update();
      stopMsg = Constants.UserStoppedScript;
      Util.cleanup(
        properties,
        fileList,
        userProperties,
        timer,
        quotaManager,
        {}
      );
      assert.equal(stubSaveState.callCount, 2, 'saveState not called twice');
      assert.equal(
        stubSaveState.getCall(1).args[2],
        stopMsg,
        'saveState called with wrong stopMsg 2'
      );
      userProperties.setProperty('stop', false);
      quotaManager.update();

      // max runtime exceeded
      properties.incrementTotalRuntime(Timer.MAX_RUNTIME_PER_DAY);
      properties.checkMaxRuntime();
      stopMsg = Constants.MaxRuntimeExceeded;
      Util.cleanup(
        properties,
        fileList,
        userProperties,
        timer,
        quotaManager,
        {}
      );
      assert.equal(stubSaveState.callCount, 3, 'saveState not called thrice');
      assert.equal(
        stubSaveState.getCall(2).args[2],
        stopMsg,
        'saveState called with wrong stopMsg 3'
      );

      // restore mocks
      stubSaveState.restore();
      stubDeleteTrigger.restore();
      userProperties.setProperty('stop', false);
      quotaManager.update();
    });

    it('should save state if retryQueue is not empty', function() {
      // set up mocks
      const stubSaveState = sinon.stub(Util, 'saveState');
      const stubDeleteTrigger = sinon.stub(TriggerService, 'deleteTrigger');
      const timer = new Timer();
      const quotaManager = new QuotaManager(timer, userProperties);
      const fileList = [{ id: 1 }, { id: 2 }, { id: 3 }];
      const properties = new Properties();
      properties.retryQueue.push(...fileList);

      // normal pause
      Util.cleanup(
        properties,
        fileList,
        userProperties,
        timer,
        quotaManager,
        {}
      );
      assert.equal(stubSaveState.callCount, 1, 'saveState not called once');

      // restore mocks
      stubSaveState.restore();
      stubDeleteTrigger.restore();
      userProperties.setProperty('stop', false);
      quotaManager.update();
    });
  });
  describe('composeErrorMsg()', function() {
    it('should return a string', function() {
      const actual = Util.composeErrorMsg({});
      assert(typeof actual === 'string', 'did not return string');
    });
    it('should prepend message with customMsg parap', function() {
      const customMsg = 'my custom message';
      const actual = Util.composeErrorMsg({}, customMsg);
      assert.notEqual(
        actual.indexOf(customMsg),
        -1,
        'did not find custom message in result'
      );
    });
    it('should include line and file identifiers in the error message', function() {
      const actual = Util.composeErrorMsg({});
      assert.notEqual(
        actual.indexOf('Line:'),
        -1,
        "did not find 'Line:' message in result"
      );
      assert.notEqual(
        actual.indexOf('File:'),
        -1,
        "did not find 'File:' message in result"
      );
    });
  });

  describe('saveState()', function() {
    xit('should save properties', function() {});
    xit('should log result', function() {});
  });
});
