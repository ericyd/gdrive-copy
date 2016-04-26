/**
 * Get userProperties for current users.
 * Get properties object from userProperties.
 * JSON.parse() and values that need parsing
 *
 * @return {object} properties JSON object with current user's properties
 */
function loadProperties() {
    var userProperties, properties, propertiesDoc, ss;

    try {
        // Get properties from propertiesDoc.  FileID for propertiesDoc is saved in userProperties
        userProperties = PropertiesService.getUserProperties().getProperties(); // {object} properties for current user
        propertiesDoc = DocumentApp.openById(userProperties.propertiesDocId).getBody();
        properties = JSON.parse(propertiesDoc.getText());
        ss = SpreadsheetApp.openById(properties.spreadsheetId).getSheetByName("Log");
    } catch (err) {
        log(ss, [err.message, err.fileName, err.lineNumber]);
    }


    // Parse the JSON objects stored in the propertiesDoc text
    try {
        properties.map = JSON.parse(properties.map);
        Logger.log("JSON.parse properties.map");
    } catch(err) {
        Logger.log(err.message);
        log(ss, [err.message, err.fileName, err.lineNumber]);
    }

    try {
        properties.leftovers = JSON.parse(properties.leftovers);
        Logger.log("JSON.parse properties.leftovers");
    } catch(err) {
        Logger.log(err.message);
        log(ss, [err.message, err.fileName, err.lineNumber]);
    }

    try {
        properties.remaining = JSON.parse(properties.remaining);
        Logger.log("JSON.parse properties.remaining");
    } catch(err) {
        Logger.log(err.message);
        log(ss, [err.message, err.fileName, err.lineNumber]);
    }



    return properties;
}