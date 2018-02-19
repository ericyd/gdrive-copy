global.Utilities = require('./mocks/Utilities');
const Util = require('../lib/Util');
const sinon = require('sinon');
const assert = require('assert');

describe('Util', function() {
  beforeEach(function() {
    this.clock = sinon.useFakeTimers();
  })
  afterEach(function() {
    this.clock.restore();
  })
  describe('exponentialBackoff()', function() {
    it('should retry 6 times on failure', function() {
      // set up mocks
      const errMsg = 'i failed';
      const failingFunc = sinon.stub().throws(errMsg);
      const stubLog = sinon.stub(Util, 'log');

      const failingFunc2 = () => {
        throw new Error(errMsg);
      }

      // set up actual
      try {
        Util.exponentialBackoff(failingFunc, 'failure message');
      } catch (e) {
      }

      // assertions
      assert.equal(failingFunc.callCount, 6, "failing func not called 6 times");
      assert.equal(stubLog.callCount, 7, "Util.log not called 7 times");

      // reset mocks
      stubLog.restore();
    });
    it('should rethrow error after 6 tries', function() {
      // set up mocks
      const errMsg = 'i failed';
      const stubLog = sinon.stub(Util, 'log');
      const failingFunc2 = () => {
        throw new Error(errMsg);
      }

      // set up actual and assert
      assert.throws(() => {
        Util.exponentialBackoff(failingFunc, 'failure message');
      }, errMsg, "threw wrong error after 6 attempts");

      // reset mocks
      stubLog.restore();
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
