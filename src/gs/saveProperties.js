/**
 * Loop through keys in properties argument,
 * converting any JSON objects to strings.
 * On completetion, save propertiesToSave to userProperties
 *
 * @param {object} propertiesToSave contains all properties that need to be saved to userProperties
 */
function saveProperties(propertiesToSave) {
    var userProperties,propertiesDoc,existingProperties,ss;


    // Attempt to access existing properties to overwrite
    try {
        userProperties = PropertiesService.getUserProperties().getProperties();
        propertiesDoc = DocumentApp.openById(userProperties.propertiesDocId).getBody();
        existingProperties = {};
        ss = SpreadsheetApp.openById(userProperties.spreadsheetId).getSheetByName("Log");
    } catch (err) {
        log(null, [err.message, err.fileName, err.lineNumber]);
    }



    // extract text from propertiesDoc
    // This will be overwritten later
    if (propertiesDoc.getText() !== "") {
        try {
            existingProperties = JSON.parse(propertiesDoc.getText());
        } catch(err) {
            log(ss, [err.message, err.fileName, err.lineNumber, Utilities.formatDate(new Date(), timeZone, "MM-dd-yy hh:mm:ss aaa")]);
        }
    }


    // Stringify all JSON objects so they can propertly save to plain text
    for (var key in propertiesToSave) {

        // skip loop if the property is from prototype
        if(!propertiesToSave.hasOwnProperty(key)) continue;

        // stringify all the objects and arrays
        if ( typeof propertiesToSave[key] !== "string" ) {
            existingProperties[key] = JSON.stringify(propertiesToSave[key]);
        } else {
            existingProperties[key] = propertiesToSave[key];
        }

        Logger.log("key: " + key + ", value: " + existingProperties[key]);


    }

    try {
        // save the object existingProperties back to propertiesDoc
        propertiesDoc.setText(JSON.stringify(existingProperties));
    } catch (err) {
        log(ss, [err.message, err.fileName, err.lineNumber, Utilities.formatDate(new Date(), timeZone, "MM-dd-yy hh:mm:ss aaa")]);
    }


}