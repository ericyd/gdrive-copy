/**
 * Create a trigger to run copy() in 121 seconds.
 * Save trigger ID to userProperties so it can be deleted later
 *
 */
function createTrigger() {
  var trigger = ScriptApp.newTrigger('copy')
    .timeBased()
    .after(6.2 * 1000 * 60) // set trigger for 6.2 minutes from now
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
 * Loop over all triggers and delete
 */
function deleteAllTriggers() {
  var allTriggers = ScriptApp.getProjectTriggers();
  for (var i = 0; i < allTriggers.length; i++) {
    ScriptApp.deleteTrigger(allTriggers[i]);
  }
}




/**
 * Loop over all triggers
 * Delete if trigger ID matches parameter triggerId
 *
 * @param {string} triggerId unique identifier for active trigger
 */
function deleteTrigger(triggerId) {
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
    } catch (err) {
      log(null, [err.message, err.fileName, err.lineNumber]);
    }
  }
}
