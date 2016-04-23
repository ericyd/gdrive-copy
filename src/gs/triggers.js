/**
 * Create a trigger to run copy() in 121 seconds.
 * Save trigger ID to userProperties so it can be deleted later
 *
 */
function createTrigger() {

    // Create trigger
    var trigger =  ScriptApp.newTrigger('copy')
        .timeBased()
        .after(121*1000)
        .create();

    Logger.log("trigger created, copy resuming in 121 seconds");


    // Save the triggerID so this trigger can be deleted later
    saveProperties({
        "triggerId": trigger.getUniqueId()
    }, null);

    return;
}



/**
 * Loop over all triggers
 * Delete if trigger ID matches parameter triggerId
 *
 * @param {string} triggerId unique identifier for active trigger
 */
function deleteTrigger(triggerId) {
    // Loop over all triggers.
    var allTriggers = ScriptApp.getProjectTriggers();
    for (var i = 0; i < allTriggers.length; i++) {
        // If the current trigger is the correct one, delete it.
        if (allTriggers[i].getUniqueId() == triggerId) {
            ScriptApp.deleteTrigger(allTriggers[i]);
            break;
        }
    }
}
