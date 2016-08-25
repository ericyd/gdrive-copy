/**
 * Create a trigger to run copy() in 121 seconds.
 * Save trigger ID to userProperties so it can be deleted later
 *
 */
function createTrigger() {
    var trigger = ScriptApp.newTrigger('copy')
        .timeBased()
        .after(121*1000)
        .create();

    if (trigger) {
        // Save the triggerID so this trigger can be deleted later
        PropertiesService.getUserProperties().setProperty('triggerId', trigger.getUniqueId());
    }
}