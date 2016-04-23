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