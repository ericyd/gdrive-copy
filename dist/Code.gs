/**
 * Copy folders and files from source to destination.
 * Get parameters from userProperties,
 * Loop until time runs out,
 * then call timeout methods, saveProperties and createTrigger.
 */
function copy() {
    // CONSTANTS
    var MAX_RUNNING_TIME = 5.1 * 60000; // return millisecs
    var START_TIME = (new Date()).getTime();
    
    
    var timeIsUp,       // {boolean} true if max execution time is reached while executing script
        currTime,       // {number} integer representing current time in milliseconds
        ss,             // {object} instance of Sheet class
        properties,     // {object} properties of current run
        query,          // {string} query to generate Files list
        files,          // {object} list of files within Drive folder
        item,           // {object} metadata of child item from current iteration
        currFolder,     // {object} metadata of folder whose children are currently being processed
        newfile,        // {Object} JSON metadata for newly created folder or file
        timeZone;       // {string} time zone of user
    
     
    try {
        // Load properties and initialize logger spreadsheet
        properties = exponentialBackoff(loadProperties, 'Error restarting script, will retry in 1-2 minutes');
    } catch (err) {
        log(null, [err.message, err.fileName, err.lineNumber]);
        exponentialBackoff(createTrigger,
            'Error setting trigger.  There has been a server error with Google Apps Script.' +
            'To successfully finish copying, please Copy Folder.');
        return;
    }

    ss = SpreadsheetApp.openById(properties.spreadsheetId).getSheetByName("Log");
    timeZone = SpreadsheetApp.openById(properties.spreadsheetId).getSpreadsheetTimeZone();


    // delete prior trigger
    if ( properties.triggerId !== undefined ) {
        try {
            // delete prior trigger
            deleteTrigger(properties.triggerId);
        } catch (err) {
            log(ss, [err.message, err.fileName, err.lineNumber]);
        }
    }


    // get current children, or skip if none exist
    if ( properties.leftovers.items && properties.leftovers.items.length > 0) {
        Logger.log("beginning processFiles on leftovers");
        properties.destFolder = properties.leftovers.items[0].parents[0].id;
        processFiles(properties.leftovers.items) ;    
    } 
    
    
    
    // When leftovers are complete, query next folder from properties.remaining
    Logger.log("beginning processFiles on next remaining folder");    
    while ( properties.remaining.length > 0 && !timeIsUp) {
        
        try {
            // if pages remained in the previous query, use them first
            if ( properties.pageToken ) {
                currFolder = properties.destFolder;
            } else {
                currFolder = properties.remaining.shift();
            }
        } catch (err) {
            log(ss, [err.message, err.fileName, err.lineNumber]);
        }

        
        
        // build query
        query = '"' + currFolder + '" in parents and trashed = false';
        
        
        // Get fileList using query. 
        // Repeat if pageToken exists (i.e. more than 1000 results return from the query)
        do {

            try {
                // Get fileList
                files = getFiles(query, properties.pageToken);
            } catch (err) {
                log(ss, [err.message, err.fileName, err.lineNumber]);
            }

            // Send items to processFiles() to copy
            if (files.items && files.items.length > 0) {
                processFiles(files.items);
            } else {
                Logger.log('No children found.');
            }
            
            // get next page token to continue iteration
            properties.pageToken = files.nextPageToken;
            
        } while (properties.pageToken && !timeIsUp);
        
    }
    
    
    
    // If timeIsUp, maximum execution time has been reached
    // Update logger spreadsheet, and save current items to properties.leftovers
    if ( timeIsUp ) {
        log(ss, ["Paused due to Google quota limits - copy will resume in 1-2 minutes"]);
        // ss.getRange(ss.getLastRow()+1, 1, 1, 1).setValue("Paused due to Google quota limits - copy will resume in 1-2 minutes");
        saveState();     
    } else {
        // If script reaches here and !timeIsUp, then the copy is complete!  
        // Delete prior trigger, move propertiesDoc to trash, and update logger spreadsheet,
         

        try {
            Drive.Files.update({"labels": {"trashed": true}},properties.propertiesDocId);
        } catch (err) {
            log(ss, [err.message, err.fileName, err.lineNumber]);
        }
        ss.getRange(2, 3, 1, 1).setValue("Complete").setBackground("#66b22c");
        ss.getRange(2, 4, 1, 1).setValue(Utilities.formatDate(new Date(), timeZone, "MM-dd-yy hh:mm:ss a"));
    }
            

    
    
    
    /**
     * Loops through array of files.items
     * and sends to the appropriate copy function (insertFolder or copyFile)
     * 
     * @param {Array} items the list of files over which to iterate
     */
    function processFiles(items) {
        while ( items.length > 0 && !timeIsUp ) {
            item = items.pop();
            currTime = (new Date()).getTime();
            timeIsUp = (currTime - START_TIME >= MAX_RUNNING_TIME);

            
            newfile = copyFile(item);


            if (newfile.id) {
                // syntax: sheet.getRange(row, column, numRows, numColumns)

                log(ss, [
                    "Copied",
                    newfile.title,
                    '=HYPERLINK("https://drive.google.com/open?id=' + newfile.id + '","'+ newfile.title + '")',
                    newfile.id,
                    Utilities.formatDate(new Date(), timeZone, "MM-dd-yy hh:mm:ss aaa")
                ]);

            } else {
                // newfile is error

                log(ss, [
                    "Error, " + newfile,
                    item.title,
                    '=HYPERLINK("https://drive.google.com/open?id=' + item.id + '","'+ item.title + '")',
                    item.id,
                    Utilities.formatDate(new Date(), timeZone, "MM-dd-yy hh:mm:ss aaa")
                ]);
            }
            
            
            
            
            // Copy permissions if selected, and if permissions exist to copy
            // if (properties.permissions && item.permissions && newfile.id) {

            if (properties.permissions) {
                if (item.mimeType == "application/vnd.google-apps.document" ||
                    item.mimeType == "application/vnd.google-apps.folder" ||
                    item.mimeType == "application/vnd.google-apps.spreadsheet" ||
                    item.mimeType == "application/vnd.google-apps.presentation" ||
                    item.mimeType == "application/vnd.google-apps.drawing" ||
                    item.mimeType == "application/vnd.google-apps.form" ||
                    item.mimeType == "application/vnd.google-apps.script" ) {
                       copyPermissions(item.id, item.owners, newfile.id);
                }   
            }

            
            
        }
    }
    
   
    
    /**
     * Try to copy file to destination parent.
     * Success:
     *   1. Log success in spreadsheet with file ID
     * Failure:
     *   1. Log error in spreadsheet with source ID
     * 
     * @param {Object} file File Resource with metadata from source file
     */
    function copyFile(file) {
        // if folder, use insert, else use copy
        if ( item.mimeType == "application/vnd.google-apps.folder") {
            try {
                var r = Drive.Files.insert({
                    "description": file.description,
                    "title": file.title,
                    "parents": [
                        {
                            "kind": "drive#fileLink",
                            "id": properties.map[file.parents[0].id]
                        }
                    ],
                    "mimeType": "application/vnd.google-apps.folder"
                });
                
                // Update list of remaining folders and map source to destination
                properties.remaining.push(file.id);
                properties.map[file.id] = r.id;
                
                return r;
            }
            
            catch(err) {
                log(ss, [err.message, err.fileName, err.lineNumber]);
                return err;
            }    
            
        } else {
            try {
                return Drive.Files.copy(
                    {
                    "title": file.title,
                    "parents": [
                        {
                            "kind": "drive#fileLink",
                            "id": properties.map[file.parents[0].id]
                        }
                    ]
                    },
                    file.id
                );
            }
            
            catch(err) {
                log(ss, [err.message, err.fileName, err.lineNumber]);
                return err;   
            }        
        }
    
    }



    /**
     * Delete existing triggers, save properties, and create new trigger
     */
    function saveState() {
        try {
            // save, create trigger, and assign pageToken for continuation
            properties.leftovers = files && files.items ? files : properties.leftovers;
            properties.pageToken = properties.leftovers.nextPageToken;
        } catch (err) {
            log(ss, [err.message, err.fileName, err.lineNumber]);
        }

        try {
            saveProperties(properties);
            exponentialBackoff(createTrigger,
                'Error setting trigger.  There has been a server error with Google Apps Script.' +
                'To successfully finish copying, please Copy Folder.');
        } catch (err) {
            log(ss, [err.message, err.fileName, err.lineNumber]);
        }
    }
}
/**
 * copy permissions from source to destination file/folder
 *
 * @param {string} srcId metadata for the source folder
 * @param {string} owners list of owners of src file
 * @param {string} destId metadata for the destination folder
 */
function copyPermissions(srcId, owners, destId) {
    var permissions, destPermissions, i, j;

    try {
        permissions = getPermissions(srcId).items;
    } catch (err) {
        log(null, [err.message, err.fileName, err.lineNumber]);
    }


    // copy editors, viewers, and commenters from src file to dest file
    if (permissions && permissions.length > 0){
        for (i = 0; i < permissions.length; i++) {

            // if there is no email address, it is only sharable by link.
            // These permissions will not include an email address, but they will include an ID
            // Permissions.insert requests must include either value or id,
            // thus the need to differentiate between permission types
            try {
                if (permissions[i].emailAddress) {
                    if (permissions[i].role == "owner") continue;

                    Drive.Permissions.insert(
                        {
                            "role": permissions[i].role,
                            "type": permissions[i].type,
                            "value": permissions[i].emailAddress
                        },
                        destId,
                        {
                            'sendNotificationEmails': 'false'
                        });
                } else {
                    Drive.Permissions.insert(
                        {
                            "role": permissions[i].role,
                            "type": permissions[i].type,
                            "id": permissions[i].id,
                            "withLink": permissions[i].withLink
                        },
                        destId,
                        {
                            'sendNotificationEmails': 'false'
                        });
                }
            } catch (err) {}

        }
    }


    // convert old owners to editors
    if (owners && owners.length > 0){
        for (i = 0; i < owners.length; i++) {
            try {
                Drive.Permissions.insert(
                    {
                        "role": "writer",
                        "type": "user",
                        "value": owners[i].emailAddress
                    },
                    destId,
                    {
                        'sendNotificationEmails': 'false'
                    });
            } catch (err) {}

        }
    }



    try {
        destPermissions = getPermissions(destId).items;
    } catch (err) {
        log(null, [err.message, err.fileName, err.lineNumber]);
    }

    if (destPermissions && destPermissions.length > 0) {
        for (i = 0; i < destPermissions.length; i++) {
            for (j = 0; j < permissions.length; j++) {
                if (destPermissions[i].id == permissions[j].id) {
                    break;
                }
                // if destPermissions does not exist in permissions, delete it
                if (j == permissions.length) {
                    Drive.Permissions.remove(destId, destPermissions[i].id);
                }
            }
        }
    }

}
//noinspection JSUnusedGlobalSymbols
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


/**
 *
 * @param {object} ss instance of Sheet class representing the logger spreadsheet
 * @param {Array} values array of values to be written to the spreadsheet
 */
function log(ss, values) {
    if (ss) {
        return ss.getRange(ss.getLastRow()+1, 1, 1, values.length).setValues([values]);
    } else {    
        ss = SpreadsheetApp.openById(PropertiesService.getUserProperties().getProperties().spreadsheetId).getSheetByName("Log");
        return ss.getRange(ss.getLastRow()+1, 1, 1, values.length).setValues([values]);
    }
}



/**
 * Invokes a function, performing up to 5 retries with exponential backoff.
 * Retries with delays of approximately 1, 2, 4, 8 then 16 seconds for a total of
 * about 32 seconds before it gives up and rethrows the last error.
 * See: https://developers.google.com/google-apps/documents-list/#implementing_exponential_backoff
 * Author: peter.herrmann@gmail.com (Peter Herrmann)
 * @param {Function} func The anonymous or named function to call.
 * @param {string} errorMsg Message to output in case of error
 * @return {*} The value returned by the called function.
 */
function exponentialBackoff(func, errorMsg) {
    for (var n=0; n<6; n++) {
        try {
            return func();
        } catch(e) {
            log(null, [e.message, e.fileName, e.lineNumber]);
            if (n == 5) {
                log(null, [errorMsg]);
                throw e;
            }
            Utilities.sleep((Math.pow(2,n)*1000) + (Math.round(Math.random() * 1000)));
        }
    }
}
/**
 * Serves HTML of the application for HTTP GET requests.
 * If folderId is provided as a URL parameter, the web app will list
 * the contents of that folder (if permissions allow). Otherwise
 * the web app will list the contents of the root folder.
 *
 * @param {Object} e event parameter that can contain information
 *     about any URL parameters provided.
 */
function doGet(e) {
  var template = HtmlService.createTemplateFromFile('Index');
 
  template.thisForm = e.parameter.thisForm;
  
  // Build and return HTML in IFRAME sandbox mode.
  return template.evaluate()
      .setTitle('Copy a Google Drive folder')
      .setSandboxMode(HtmlService.SandboxMode.IFRAME);
}







/**
 * Create top level destination folder,
 * create logger spreadsheet.
 * Save properties to userProperties.
 * Return IDs of created destination folder and logger spreadsheet
 * 
 * @param {object} selectedFolder contains srcId, srcParentId, destName, permissions, srcName
 */
function initialize(selectedFolder) {
    var destFolder,     // {Object} instance of Folder class representing destination folder
        spreadsheet,    // {Object} instance of Spreadsheet class
        propertiesDoc,  // {Object} metadata for Google Document created to hold properties
        userProperties, // {Object} instance of UserProperties object
        today = Utilities.formatDate(new Date(), "GMT-5", "MM-dd-yyyy"); // {string} date of copy
    

    // create destination folder
    try {
        destFolder = Drive.Files.insert({
            "description": "Copy of " + selectedFolder.srcName + ", created " + today,
            "title": selectedFolder.destName,
            "parents": [
                {
                    "kind": "drive#fileLink",
                    "id": selectedFolder.destLocation == "same" ? selectedFolder.srcParentId : DriveApp.getRootFolder().getId()
                }
            ],
            "mimeType": "application/vnd.google-apps.folder"
        });   
    }
    catch(err) {
        Logger.log(err.message);
    }
    
    
    
    // create logger spreadsheet
    try {
        spreadsheet = Drive.Files.copy(
            {
            "title": "Copy Folder Log " + today,
            "parents": [
                {
                    "kind": "drive#fileLink",
                    "id": destFolder.id
                }
            ]
            },
            "17xHN9N5KxVie9nuFFzCur7WkcMP7aLG4xsPis8Ctxjg"
        );   
    }
    catch(err) {
        Logger.log(err.message);
    }
    
    
    
    // create document for storing properties as plain text
    // this will be deleted upon script completion
    try {
        propertiesDoc = Drive.Files.insert({
            "description": "This document will be deleted after the folder copy is complete.  It is only used to store properties necessary to complete the copying procedure",
            "title": "DO NOT DELETE OR MODIFY - will be deleted after copying completes",
            "parents": [
                {
                    "kind": "drive#fileLink",
                    "id": destFolder.id
                }
            ],
            "mimeType": "application/vnd.google-apps.document"
        });   
    }
    catch(err) {
        Logger.log(err.message);
    }


    if (selectedFolder.permissions) {
        // Copy permissions of top-level folder
        copyPermissions(selectedFolder.srcId, null, destFolder.id);
    }


    
    // add link to destination folder to logger spreadsheet
    SpreadsheetApp.openById(spreadsheet.id).getSheetByName("Log").getRange(2,5).setValue('=HYPERLINK("https://drive.google.com/open?id=' + destFolder.id + '","'+ selectedFolder.destName + '")');
    
    
    
    // Get IDs of destination folder and logger spreadsheet 
    selectedFolder.destId = destFolder.id;
    selectedFolder.spreadsheetId = spreadsheet.id;
    selectedFolder.propertiesDocId = propertiesDoc.id;
    
    
    
    // initialize map with top level source and destination folder
    selectedFolder.leftovers = {}; // {Object} FileList object (returned from Files.list) for items not processed in prior execution (filled in saveState)
    selectedFolder.map = {};       // {Object} map of source ids (keys) to destination ids (values)
    selectedFolder.map[selectedFolder.srcId] = selectedFolder.destId;
    selectedFolder.remaining = [selectedFolder.srcId]; 
    
    
    
    // save srcId, destId, copyPermissions, spreadsheetId to userProperties
    userProperties = PropertiesService.getUserProperties();
    userProperties.setProperty("spreadsheetId", selectedFolder.spreadsheetId);
    userProperties.setProperty("propertiesDocId", selectedFolder.propertiesDocId);
    saveProperties(selectedFolder);
    
    
    return {
        spreadsheetId: selectedFolder.spreadsheetId,
        destId: selectedFolder.destId
    };
    
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

    try {
        // Get properties from propertiesDoc.  FileID for propertiesDoc is saved in userProperties
        userProperties = PropertiesService.getUserProperties().getProperties(); // {object} properties for current user
        propertiesDoc = DocumentApp.openById(userProperties.propertiesDocId).getBody();
        properties = JSON.parse(propertiesDoc.getText());
    } catch (err) {
        throw err;
    }

    try {
        properties.map = JSON.parse(properties.map);
        properties.leftovers = JSON.parse(properties.leftovers);
        properties.remaining = JSON.parse(properties.remaining);
    } catch (err) {
        throw err;
    }


    return properties;
}
/**
 * Loop through keys in properties argument,
 * converting any JSON objects to strings.
 * On completetion, save propertiesToSave to userProperties
 *
 * @param {object} propertiesToSave contains all properties that need to be saved to userProperties
 */
function saveProperties(propertiesToSave) {
    var userProperties,propertiesDoc,existingProperties,ss;
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
            log(ss, [err.message, err.fileName, err.lineNumber]);
        }
    }


    // Stringify all JSON objects so they can propertly save to plain text
    for (var key in propertiesToSave) {

        // skip loop if the property is from prototype
        if(!propertiesToSave.hasOwnProperty(key)) continue;

        // stringify all the objects and arrays
        if ( typeof propertiesToSave[key] === "object" ) {
            propertiesToSave[key] = JSON.stringify(propertiesToSave[key]);
        }

        existingProperties[key] = propertiesToSave[key];

    }


    // save the object existingProperties back to propertiesDoc
    propertiesDoc.setText(JSON.stringify(existingProperties));

}
//noinspection JSUnusedGlobalSymbols
/**
 * Returns number of existing triggers for user.
 * @return {number} triggers the number of active triggers for this user
 */
function getTriggersQuantity() {
    return ScriptApp.getProjectTriggers().length;
}



/**
 * Create a trigger to run copy() in 121 seconds.
 * Save trigger ID to userProperties so it can be deleted later
 *
 */
function createTrigger() {
    var trigger = ScriptApp.newTrigger('copy')
        .timeBased()
        .after(121*1000)
        .create();

    if (trigger) {
        // Save the triggerID so this trigger can be deleted later
        saveProperties({
            "triggerId": trigger.getUniqueId()
        });
    }
}



/**
 * Loop over all triggers
 * Delete if trigger ID matches parameter triggerId
 *
 * @param {string} triggerId unique identifier for active trigger
 */
function deleteTrigger(triggerId) {
    try {
        // Loop over all triggers.
        var allTriggers = ScriptApp.getProjectTriggers();
        for (var i = 0; i < allTriggers.length; i++) {
            // If the current trigger is the correct one, delete it.
            if (allTriggers[i].getUniqueId() == triggerId) {
                ScriptApp.deleteTrigger(allTriggers[i]);
                break;
            }
        }
    } catch (err) {
        log(ss, [err.message, err.fileName, err.lineNumber]);
    }
    
}



/**
 * Loop over all triggers and delete
 */
function deleteAllTriggers() {
    var allTriggers = ScriptApp.getProjectTriggers();
    for (var i = 0; i < allTriggers.length; i++) {
        ScriptApp.deleteTrigger(allTriggers[i]);
    }
}