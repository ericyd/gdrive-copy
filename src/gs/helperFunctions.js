/**
 * Loop through keys in properties argument and save each to the userProperties for the script
 * 
 * @param {object} properties contains all properties that need to be saved to userProperties
 */
function saveProperties(propertiesToSave) {
    
    var userProperties = PropertiesService.getUserProperties();
    var propsObj = userProperties.getProperties();
    
    for (var key in propertiesToSave) {
        
        // skip loop if the property is from prototype
        if(!propsObj.hasOwnProperty(key)) continue;
        
        userProperties.setProperty(key, propertiesToSave[key]);
        
    }
    
    return;

}




/**
 * Create a trigger to run copy() in @param seconds seconds
 * @param {number} seconds number of seconds after present to fire the trigger
 */
function createTrigger(seconds) {
    // create trigger for 'seconds' seconds from now
    return ScriptApp.newTrigger('copy')
        .timeBased()
        .after(seconds*1000)	
        .create();
}




/**
 * Returns token for use with Google Picker
 */
function getOAuthToken() {
    return ScriptApp.getOAuthToken();
}


