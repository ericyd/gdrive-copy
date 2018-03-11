/**********************************************
 * Namespace for trigger-related methods
 **********************************************/
var TriggerService = {};

/**
 * Create a trigger to run copy() in 121 seconds.
 * Save trigger ID to userProperties so it can be deleted later
 */
TriggerService.createTrigger = function(duration) {
  // default is 6.2 minutes from now
  // Timer will stop execution after 4.7 minutes, so this gives about 1.5 minutes buffer
  duration = duration || Timer.sixMinutes;
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
};

/**
 * Loop over all triggers
 * Delete if trigger ID matches parameter triggerId
 * @param {string} triggerId unique identifier for active trigger
 */
TriggerService.deleteTrigger = function(triggerId) {
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
      Util.log(null, Util.composeErrorMsg(e));
    }
  }
};

//removeIf(production)
// Google Apps Script doesn't play well with module.exports,
// but it is required for testing
module.exports = TriggerService;
//endRemoveIf(production)
