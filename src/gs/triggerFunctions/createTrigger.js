/**
 * Create a trigger to run copy() in 121 seconds.
 * Save trigger ID to userProperties so it can be deleted later
 *
 */
function createTrigger() {
    var trigger = ScriptApp.newTrigger('copy')
        .timeBased()
        .after(6.2*1000*60) // set trigger for 6.2 minutes from now
        .create();

    if (trigger) {
        // Save the triggerID so this trigger can be deleted later
        PropertiesService.getUserProperties().setProperty('triggerId', trigger.getUniqueId());
    }
}