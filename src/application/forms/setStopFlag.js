/**
 * Set a flag in the userProperties store that will cancel the current copy folder process 
 */
function setStopFlag() {
    return PropertiesService.getUserProperties().setProperty('stop', 'true');
}