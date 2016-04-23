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