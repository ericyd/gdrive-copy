/**
 * Copy folders and files from source to destination.
 * Get parameters from userProperties,
 * Loop until time runs out,
 * then call timeout methods, saveProperties and createTrigger.
 */
function copy() {
    // CONSTANTS
    var MAX_RUNNING_TIME = 5.3 * 60 * 1000;   // 5.3 minutes in milliseconds
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
        
        
    
    // Load properties and initialize logger spreadsheet
    properties = loadProperties();
    Logger.log("properties loaded");    
    ss = SpreadsheetApp.openById(properties.spreadsheetId).getSheetByName("Log");
    timeZone = SpreadsheetApp.openById(properties.spreadsheetId).getSpreadsheetTimeZone();
    
    
    
    // get current children, or skip if none exist
    if ( properties.leftovers.items && properties.leftovers.items.length > 0) {
        Logger.log("beginning processFiles on leftovers");
        properties.destFolder = properties.leftovers.items[0].parents[0].id;
        processFiles(properties.leftovers.items) ;    
    } 
    
    
    
    // When leftovers are complete, query next folder from properties.remaining
    Logger.log("beginning processFiles on next remaining folder");    
    while ( properties.remaining.length > 0 && !timeIsUp) {
        
        
        // if pages remained in the previous query, use them first
        if ( properties.pageToken ) {
            currFolder = properties.destFolder;
        } else {
            currFolder = properties.remaining.shift();
        }
        
        
        // build query
        query = '"' + currFolder + '" in parents and trashed = false';
        
        
        // Get fileList using query. 
        // Repeat if pageToken exists (i.e. more than 1000 results return from the query)
        do {
            
            // Get fileList
            files = getFiles(query, properties.pageToken);
            
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
         
        if ( properties.triggerId !== undefined ) {
            // delete prior trigger
            deleteTrigger(properties.triggerId);    
        }
        Drive.Files.update({"labels": {"trashed": true}},properties.propertiesDocId);
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
            
            
            
            // copy folder or file
            if ( item.mimeType == "application/vnd.google-apps.folder") {
                newfile = insertFolder(item);    
            } else {
                newfile = copyFile(item);
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
                       Logger.log("item type = " + item.mimeType);
                       Logger.log("copying permissions");
                       copyPermissions(item.id, item.owners, newfile.id);
                }   
            }
            
            
            
            // report success or failure on spreadsheet log
            if (newfile.id) {
                // syntax: sheet.getRange(row, column, numRows, numColumns) 
                /*ss.getRange(ss.getLastRow()+1, 1, 1, 5).setValues([[
                    "Copied",
                    newfile.title,
                    '=HYPERLINK("https://drive.google.com/open?id=' + newfile.id + '","'+ newfile.title + '")',
                    newfile.id, 
                    Utilities.formatDate(new Date(), timeZone, "MM-dd-yy hh:mm:ss aaa")
                ]]);*/

                log(ss, [
                    "Copied",
                    newfile.title,
                    '=HYPERLINK("https://drive.google.com/open?id=' + newfile.id + '","'+ newfile.title + '")',
                    newfile.id,
                    Utilities.formatDate(new Date(), timeZone, "MM-dd-yy hh:mm:ss aaa")
                ]);
                
            } else {
                // newfile is error
                /*ss.getRange(ss.getLastRow()+1, 1, 1, 5).setValues([[
                    "Error, " + newfile,
                    item.title,
                    '=HYPERLINK("https://drive.google.com/open?id=' + item.id + '","'+ item.title + '")',
                    item.id,
                    Utilities.formatDate(new Date(), timeZone, "MM-dd-yy hh:mm:ss aaa")
                ]]);*/

                log(ss, [
                    "Error, " + newfile,
                    item.title,
                    '=HYPERLINK("https://drive.google.com/open?id=' + item.id + '","'+ item.title + '")',
                    item.id,
                    Utilities.formatDate(new Date(), timeZone, "MM-dd-yy hh:mm:ss aaa")
                ]);
            }
            
            
        }
    }
    
   
    /**
     * Try to insert folder with information from src file.
     * Success: 
     *   1. Add key/value to properties.map with src/dest folder ID pair
     *   2. Add dest folder ID to properties.remaining array
     *   3. Add note to Logger spreadsheet with destination folder ID
     * Failure:
     *   1. Log failure in spreadsheet with src ID
     * 
     * @pararm {Object} file File Resource with metadata from source folder
     */
    function insertFolder(file) {
        
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
            Logger.log(err.message);
            return err;
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
            Logger.log(err.message);
            return err;   
        }        
    }



    /**
     * Delete existing triggers, save properties, and create new trigger
     */
    function saveState() {
        if ( properties.triggerId !== undefined ) {
            // delete prior trigger
            deleteTrigger(properties.triggerId);    
        }
        
        // save, create trigger, and assign pageToken for continuation
        properties.leftovers = files && files.items ? files : properties.leftovers;
        properties.pageToken = properties.leftovers.nextPageToken;
        
        saveProperties(properties, createTrigger);
    }
}