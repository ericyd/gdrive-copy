/**
 * Returns number of existing triggers for user.
 * @return {number} triggers the number of active triggers for this user
 */
function getTriggersQuantity() {
    return ScriptApp.getProjectTriggers().length;
}