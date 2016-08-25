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