/**
 * Loop through keys in properties argument,
 * converting any JSON objects to strings.
 * On completetion, save propertiesToSave to userProperties
 * 
 * @param {object} propertiesToSave contains all properties that need to be saved to userProperties
 * @param {function} callback callback function to run after properties are saved
 */
function saveProperties(propertiesToSave, callback) {
    var userProperties = PropertiesService.getUserProperties().getProperties();
    var propertiesDoc = DocumentApp.openById(userProperties.propertiesDocId).getBody();
    var existingProperties = {};
    
    
    // extract text from propertiesDoc
    // This will be overwritten later
    if (propertiesDoc.getText() !== "") {
        try {
            existingProperties = JSON.parse(propertiesDoc.getText());
        } catch(err) {
            Logger.log("propsCell error: " + err);
        }
    }
    
    
    // Stringify all JSON objects so they can propertly save to plain text
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
        
        
        // update existingProperties with new properties values
        existingProperties[key] = propertiesToSave[key];
        
    }
    
    
    
    // save the object existingProperties back to propertiesDoc
    try {
        propertiesDoc.setText(JSON.stringify(existingProperties));
    } catch(err) {
        Logger.log("setValue error: " + err);
    }
    
    
    
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
    
    
    // Get properties from propertiesDoc.  FileID for propertiesDoc is saved in userProperties
    userProperties = PropertiesService.getUserProperties().getProperties(); // {object} properties for current user
    propertiesDoc = DocumentApp.openById(userProperties.propertiesDocId).getBody();
    properties = JSON.parse(propertiesDoc.getText());
    
    
    // Parse the JSON objects stored in the propertiesDoc text
    try {
        properties.map = JSON.parse(properties.map);
        Logger.log("JSON.parse properties.map");
    } catch(err) {
        Logger.log(err.message);
    }
    
    try {
        properties.leftovers = JSON.parse(properties.leftovers);
        Logger.log("JSON.parse properties.leftovers");
    } catch(err) {
        Logger.log(err.message);
    }
    
    try {
        properties.remaining = JSON.parse(properties.remaining);
        Logger.log("JSON.parse properties.remaining");
    } catch(err) {
        Logger.log(err.message);
    }
    
    
    
    return properties;
}





/**
 * Create a trigger to run copy() in 121 seconds.
 * Save trigger ID to userProperties so it can be deleted later
 * 
 */
function createTrigger() {
    
    // Create trigger
    var trigger =  ScriptApp.newTrigger('copy')
        .timeBased()
        .after(121*1000)	
        .create();
        
    Logger.log("trigger created, copy resuming in 121 seconds");
    
    
    // Save the triggerID so this trigger can be deleted later    
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



/**
 * Returns metadata for input file ID
 * 
 * @param {string} id the folder ID for which to return metadata
 * @return {object} the permissions for the folder
 */
function getPermissions(id) {
    return Drive.Permissions.list(id);
}




/**
 * Gets files from query and returns fileList with metadata
 * 
 * @param {string} query the query to select files from the Drive
 * @param {string} pageToken the pageToken (if any) for the existing query
 * @return {object} fileList object where fileList.items is an array of children files
 */
function getFiles(query, pageToken) {
    var fileList;
    
    fileList = Drive.Files.list({
                    q: query,
                    maxResults: 1000,
                    pageToken: pageToken
                });
        
    return fileList;    
} 