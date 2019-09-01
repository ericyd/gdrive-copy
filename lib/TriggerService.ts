/**********************************************
 * Namespace for trigger-related methods
 **********************************************/

import Util from './Util';
import Timer from './Timer';
import Logging from './Logging';

export default class TriggerService {
  /**
   * Create a trigger to run copy() in 121 seconds.
   * Save trigger ID to userProperties so it can be deleted later
   */
  static createTrigger(duration: number): void {
    // default is 6.2 minutes from now
    // Timer will stop execution after 4.7 minutes, so this gives about 1.5 minutes buffer
    duration = duration || Timer.TRIGGER_TIME;
    var trigger = ScriptApp.newTrigger('copy')
      .timeBased()
      .after(duration)
      .create();

    if (trigger) {
      // Save the triggerID so this trigger can be deleted later
      PropertiesService.getUserProperties().setProperty(
        'triggerId',
        trigger.getUniqueId()
      );
    }
  }

  /**
   * Loop over all triggers
   * Delete if trigger ID matches parameter triggerId
   * @param {string} triggerId unique identifier for active trigger
   */
  static deleteTrigger(triggerId: string): void {
    if (triggerId !== undefined && triggerId !== null) {
      try {
        // Loop over all triggers.
        var allTriggers = ScriptApp.getProjectTriggers();
        for (var i = 0; i < allTriggers.length; i++) {
          // If the current trigger is the correct one, delete it.
          if (allTriggers[i].getUniqueId() == triggerId) {
            ScriptApp.deleteTrigger(allTriggers[i]);
            break;
          }
        }
      } catch (e) {
        Logging.log({ status: Util.composeErrorMsg(e) });
      }
    }
  }
}
