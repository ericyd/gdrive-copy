/**
 * Create a trigger to run copy() in 121 seconds.
 * Save trigger ID to userProperties so it can be deleted later
 *
 */
function createTrigger() {
    // modelled after exponential backoff found here: https://gist.github.com/peterherrmann/2700284
    for (var n=0; n<6; n++) {
        try {
            // Create trigger
            var trigger =  ScriptApp.newTrigger('copy')
                .timeBased()
                .after(121*1000)
                .create();
            
            
            // Save the triggerID so this trigger can be deleted later
            saveProperties({
                "triggerId": trigger.getUniqueId()
            });
            
        } catch(err) {
            log(ss, [err.message, err.fileName, err.lineNumber, "trial # " + n]);
            if (n == 5) {
                log(ss, ["tried 6 times, could not complete"]);
            } 
            Utilities.sleep((Math.pow(2,n)*1000) + (Math.round(Math.random() * 1000)));
        }    
    }
}



/**
 * Loop over all triggers
 * Delete if trigger ID matches parameter triggerId
 *
 * @param {string} triggerId unique identifier for active trigger
 */
function deleteTrigger(triggerId) {
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
        log(ss, [err.message, err.fileName, err.lineNumber]);
    }
    
}
