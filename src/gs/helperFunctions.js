/**
 * Loop through keys in properties argument,
 * converting any JSON objects to strings.
 * On completetion, save propertiesToSave to userProperties
 * 
 * @param {object} propertiesToSave contains all properties that need to be saved to userProperties
 */
function saveProperties(propertiesToSave) {
    
    var userProperties = PropertiesService.getUserProperties();
    
    for (var key in propertiesToSave) {
        
        // skip loop if the property is from prototype
        if(!propertiesToSave.hasOwnProperty(key)) continue;
        
        if ( typeof propertiesToSave[key] === 'object' ) {
            propertiesToSave[key] = JSON.stringify(propertiesToSave[key]);
        }
        
    }
    
    userProperties.setProperties(propertiesToSave);
    
    return;

}




/**
 * Create a trigger to run copy() in @param seconds seconds
 * @param {number} seconds number of seconds after present to fire the trigger
 */
function createTrigger(seconds) {
    // create trigger for 'seconds' seconds from now
    ScriptApp.newTrigger('copy')
        .timeBased()
        .after(seconds*1000)	
        .create();
        
    return;
}




/**
 * Returns token for use with Google Picker
 */
function getOAuthToken() {
    return ScriptApp.getOAuthToken();
}


