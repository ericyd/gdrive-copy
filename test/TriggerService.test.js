import TriggerService from '../lib/TriggerService';
import Trigger from './mocks/Trigger';
import ScriptApp from './mocks/ScriptApp';
ScriptApp.getProjectTriggers = stub().returns([
  new Trigger('test1'),
  new Trigger('test2')
]);
global.ScriptApp = ScriptApp;
import PropertiesService from './mocks/PropertiesService';
global.PropertiesService = PropertiesService;
const assert = require('assert');
import { stub } from 'sinon';
import Timer from '../lib/Timer';

describe('TriggerService', function() {
  describe('createTrigger', function() {
    it('creates a trigger with custom duration', function() {
      const duration = 20;
      TriggerService.createTrigger(20);
      const triggerId = JSON.parse(
        PropertiesService.getUserProperties().getProperty('triggerId')
      );
      assert.equal(triggerId.duration, duration);
      assert.equal(triggerId.basis, 'time');
      assert.equal(triggerId.created, true);
      assert.equal(triggerId.name, 'copy');
    });

    it('creates a trigger with default duration', function() {
      TriggerService.createTrigger();
      const triggerId = JSON.parse(
        PropertiesService.getUserProperties().getProperty('triggerId')
      );
      assert.equal(triggerId.duration, Timer.TRIGGER_TIME);
      assert.equal(triggerId.basis, 'time');
      assert.equal(triggerId.created, true);
      assert.equal(triggerId.name, 'copy');
    });
  });

  describe('deleteTrigger', function() {
    it('deletes a trigger', function() {
      const scriptAppDeleteTrigger = stub(ScriptApp, 'deleteTrigger');
      const triggerId = `{"created": ${undefined}, "duration": ${undefined}, "basis": "${undefined}", "name": "${'test2'}"}`;
      TriggerService.deleteTrigger(triggerId);
      assert.equal(
        scriptAppDeleteTrigger.getCall(0).args[0].toString(),
        new Trigger('test2').toString()
      );
      assert(scriptAppDeleteTrigger.calledOnce);
    });
  });
});
