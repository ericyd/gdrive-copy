import Trigger from './Trigger';

export default class ScriptApp {
  static newTrigger(name) {
    return new Trigger(name);
  }
  static getProjectTriggers() {
    return [new Trigger('test1'), new Trigger('test2')];
  }

  static deleteTrigger(triggerId) {
    return triggerId;
  }
}
