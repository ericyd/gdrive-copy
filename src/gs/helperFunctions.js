/**
 * Loop through keys in properties argument,
 * converting any JSON objects to strings.
 * On completetion, save propertiesToSave to userProperties
 * 
 * @param {object} propertiesToSave contains all properties that need to be saved to userProperties
 */
function saveProperties(propertiesToSave, callback) {
    var userProperties = PropertiesService.getUserProperties().getProperties();
    var propertiesDoc = DocumentApp.openById(userProperties.propertiesDocId).getBody();
    //var userProperties = PropertiesService.getUserProperties();
    var existingProperties = {};
    
    if (propertiesDoc.getText() !== "") {
        try {
            existingProperties = JSON.parse(propertiesDoc.getText());
        } catch(err) {
            Logger.log("propsCell error: " + err);
        }
    }
    
    for (var key in propertiesToSave) {
        
        // skip loop if the property is from prototype
        if(!propertiesToSave.hasOwnProperty(key)) continue;
        
        // stringify all the objects and arrays
        if ( typeof propertiesToSave[key] === "object" ) {
            try {
                propertiesToSave[key] = JSON.stringify(propertiesToSave[key]);
            } catch(err) {
                Logger.log("propertiesToSave error: key = " + key + ", " + err);
            }
        } 
        
        
        // update existingProperties
        existingProperties[key] = propertiesToSave[key];
        
    }
    
    try {
        propertiesDoc.setText(JSON.stringify(existingProperties));
    } catch(err) {
        Logger.log("setValue error: " + err);
    }
    
    
    //userProperties.setProperties(propertiesToSave);
    
    if (callback) {
        callback();    
    }
    
    Logger.log("properties saved");
    
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
    var userProperties, properties, propertiesDoc;
    
    userProperties = PropertiesService.getUserProperties().getProperties(); // {object} properties for current user
    propertiesDoc = DocumentApp.openById(userProperties.propertiesDocId).getBody();
    properties = JSON.parse(propertiesDoc.getText());
    
    try {
        properties.map = JSON.parse(properties.map);
        Logger.log("JSON.parse properties.map");
    } catch(err) {
        Logger.log(err.message);
    }
    
    try {
        properties.currChildren = JSON.parse(properties.currChildren);
        Logger.log("JSON.parse properties.currChildren");
    } catch(err) {
        Logger.log(err.message);
    }
    
    try {
        properties.remaining = JSON.parse(properties.remaining);
        Logger.log("JSON.parse properties.remaining");
    } catch(err) {
        Logger.log(err.message);
    }
    
    try {
        properties.errorFiles = JSON.parse(properties.errorFiles);
        Logger.log("JSON.parse properties.errorFiles");
    } catch(err) {
        Logger.log(err.message);
    }
    
    
    
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
        
    Logger.log("trigger created, copy resuming in 61 seconds");
        
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