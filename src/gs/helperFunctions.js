/**
 * Loop through keys in properties argument,
 * converting any JSON objects to strings.
 * On completetion, save propertiesToSave to userProperties
 * 
 * @param {object} propertiesToSave contains all properties that need to be saved to userProperties
 */
function saveProperties(propertiesToSave, callback) {
    
    var userProperties = PropertiesService.getUserProperties();
    
    for (var key in propertiesToSave) {
        
        // skip loop if the property is from prototype
        if(!propertiesToSave.hasOwnProperty(key)) continue;
        
        if ( typeof propertiesToSave[key] === 'object' ) {
            propertiesToSave[key] = JSON.stringify(propertiesToSave[key]);
        }
        
    }
    
    userProperties.setProperties(propertiesToSave);
    
    if (callback) {
        callback();    
    }
    
    return;
}



/**
 * Get userProperties for current users.
 * Get properties object from userProperties.
 * JSON.parse() and values that need parsing
 * 
 * @return {object} properties JSON object with current user's properties
 */
function loadProperties() {
    var userProperties, properties;
    
    userProperties = PropertiesService.getUserProperties(); // {object} instance of Properties class
    properties = userProperties.getProperties();
    
    properties.map = JSON.parse(properties.map);
    properties.remaining = JSON.parse(properties.remaining);
    properties.currChildren = JSON.parse(properties.currChildren);
    
    ss = SpreadsheetApp.openById(properties.spreadsheetId).getSheetByName("Log");
    
    return properties;
}



/**
 * Create a trigger to run copy() in 61 seconds.
 * Save trigger ID to userProperties so it can be deleted later
 * 
 */
function createTrigger() {
    var trigger =  ScriptApp.newTrigger('copy')
        .timeBased()
        .after(61*1000)	
        .create();
        
    saveProperties({
        "triggerId": trigger.getUniqueId();
    }, null);
        
    return;
}



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




/**
 * Returns token for use with Google Picker
 */
function getOAuthToken() {
    return ScriptApp.getOAuthToken();
}




/**
 * Returns metadata for input file ID
 * 
 * @param {string} id the folder ID for which to return metadata
 * @return {object} the metadata for the folder
 */
function getMetadata(id) {
    return Drive.Files.get(id);
}