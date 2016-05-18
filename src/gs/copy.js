/**
 * Copy folders and files from source to destination.
 * Get parameters from userProperties,
 * Loop until time runs out,
 * then call timeout methods, saveProperties and createTrigger.
 *
 * @param {boolean} resuming whether or not the copy call is resuming an existing folder copy or starting fresh
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

        var n = Number(PropertiesService.getUserProperties().getProperties()['trials']);
        Logger.log(n);

        if (n < 5) {
            Logger.log('setting trials property');
            PropertiesService.getUserProperties().setProperty('trials', (n + 1).toString());

            exponentialBackoff(createTrigger,
                'Error setting trigger.  There has been a server error with Google Apps Script.' +
                'To successfully finish copying, please refresh the app and click "Resume Copying"' +
                'and follow the instructions on the page.');
        }
        return;
    }

    ss = SpreadsheetApp.openById(properties.spreadsheetId).getSheetByName("Log");
    timeZone = SpreadsheetApp.openById(properties.spreadsheetId).getSpreadsheetTimeZone() || 'GMT-7';


    // delete prior trigger
    if ( properties.triggerId !== undefined ) {
        try {
            // delete prior trigger
            deleteTrigger(properties.triggerId);
        } catch (err) {
            log(ss, [err.message, err.fileName, err.lineNumber, Utilities.formatDate(new Date(), timeZone, "MM-dd-yy hh:mm:ss aaa")]);
        }
    }


    // get current children, or skip if none exist
    if ( properties.leftovers.items && properties.leftovers.items.length > 0) {
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
            log(ss, [err.message, err.fileName, err.lineNumber, Utilities.formatDate(new Date(), timeZone, "MM-dd-yy hh:mm:ss aaa")]);
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