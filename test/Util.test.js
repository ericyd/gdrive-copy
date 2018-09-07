global.Utilities = require('./mocks/Utilities');
const Util = require('../lib/Util');
const Timer = require('../lib/Timer');
const TriggerService = require('../lib/TriggerService');
const userProperties = require('./mocks/PropertiesService').getUserProperties();
const Properties = require('../lib/Properties');
const sinon = require('sinon');
const assert = require('assert');

describe('Util', function() {
  describe('exponentialBackoff()', function() {
    it('should retry 6 times on failure', function() {
      // set up mocks
      const errMsg = 'i failed';
      const failingFunc = sinon.stub().throws(errMsg);
      const stubLog = sinon.stub(Util, 'log');

      const failingFunc2 = () => {
        throw new Error(errMsg);
      };

      // set up actual
      try {
        Util.exponentialBackoff(failingFunc, 'failure message');
      } catch (e) {}

      // assertions
      assert.equal(failingFunc.callCount, 6, 'failing func not called 6 times');
      assert.equal(stubLog.callCount, 7, 'Util.log not called 7 times');

      // reset mocks
      stubLog.restore();
    });
    it('should rethrow error after 6 tries', function() {
      // set up mocks
      const errMsg = 'i failed';
      const stubLog = sinon.stub(Util, 'log');
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

      // reset mocks
      stubLog.restore();
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
      this.clock.tick(Timer.sixMinutes);
      timer.update(userProperties);
      const fileList = [{ id: 1 }, { id: 2 }, { id: 3 }];
      const properties = new Properties();

      // scenarios

      // normal pause
      let stopMsg = Util.msgs.singleRunExceeded;
      Util.cleanup(properties, fileList, userProperties, timer, {});
      assert(stubSaveState.calledOnce, 'saveState not called');
      assert.equal(
        stubSaveState.getCall(0).args[2],
        stopMsg,
        'saveState called with wrong stopMsg'
      );

      // user set stop flag
      userProperties.setProperty('stop', 'true');
      timer.update(userProperties);
      stopMsg = Util.msgs.userStoppedScript;
      Util.cleanup(properties, fileList, userProperties, timer, {});
      assert.equal(stubSaveState.callCount, 2, 'saveState not called twice');
      assert.equal(
        stubSaveState.getCall(1).args[2],
        stopMsg,
        'saveState called with wrong stopMsg'
      );
      userProperties.setProperty('stop', false);
      timer.update(userProperties);

      // max runtime exceeded
      properties.incrementTotalRuntime(Timer.MAX_RUNTIME_PER_DAY);
      properties.checkMaxRuntime();
      stopMsg = Util.msgs.maxRuntimeExceeded;
      Util.cleanup(properties, fileList, userProperties, timer, {});
      assert.equal(stubSaveState.callCount, 3, 'saveState not called thrice');
      assert.equal(
        stubSaveState.getCall(2).args[2],
        stopMsg,
        'saveState called with wrong stopMsg'
      );

      // restore mocks
      stubSaveState.restore();
      stubDeleteTrigger.restore();
      userProperties.setProperty('stop', false);
      timer.update(userProperties);
    });
  });
  describe('composeErrorMsg()', function() {
    it('should return an array', function() {
      const actual = Util.composeErrorMsg({});
      assert(Array.isArray(actual), 'did not return array');
    });
    it('should prepend message with customMsg parap', function() {
      const customMsg = 'my custom message';
      const actual = Util.composeErrorMsg({}, customMsg);
      assert.notEqual(
        actual[0].indexOf(customMsg),
        -1,
        'did not find custom message in result'
      );
    });
    it('should include line and file identifiers in the error message', function() {
      const actual = Util.composeErrorMsg({});
      assert.notEqual(
        actual[0].indexOf('Line:'),
        -1,
        "did not find 'Line:' message in result"
      );
      assert.notEqual(
        actual[0].indexOf('File:'),
        -1,
        "did not find 'File:' message in result"
      );
    });
  });
  describe('log()', function() {
    xit('should log to spreadsheet', function() {});
    xit('should get spreadsheet if not passed as arg', function() {});
  });
  describe('saveState()', function() {
    xit('should save properties', function() {});
    xit('should log result', function() {});
  });
});
