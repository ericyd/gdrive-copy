/**
 * Copy folders and files from source to destination.
 * Get parameters from userProperties,
 * Loop until time runs out,
 * then call timeout methods, saveProperties and createTrigger.
 */
function copy() {
    // CONSTANTS
    var MAX_RUNNING_TIME = 5.7 * 60 * 1000;   // 5.7 minutes in milliseconds
    var START_TIME = (new Date()).getTime();
    
    
    var timeIsUp,       // {boolean} true if max execution time is reached while executing script
        permissions,    // {boolean} true if sharing permissions should be copied from source to destination
        currTime,       // {number} integer representing current time in milliseconds
        copyObject,     // {object} all the files and folders to copy
        srcId,          // {string} identification for top level source folder
        destId,         // {string} identification for top level destination folder
        ss,             // {object} instance of Sheet class
        properties,     // {object} properties of current run
        query,          // {string} query to generate Files list
        files,          // {object} list of files within Drive folder
        item,           // {object} metadata of child item from current iteration
        currFolder,     // {object} metadata of folder whose children are currently being processed
        newfile,        // {Object} JSON metadata for newly created folder or file
        errorFiles,     // {Array} array of src files that had error
        timeZone,       // {string} time zone of user
        timeIsUp = false; // {boolean}
        
        
    
    
    properties = loadProperties();
    Logger.log("properties loaded");    
    ss = SpreadsheetApp.openById(properties.spreadsheetId).getSheetByName("Log");
    timeZone = SpreadsheetApp.openById(properties.spreadsheetId).getSpreadsheetTimeZone();
    
    
    // get current children, or if none exist, query next folder from properties.remaining
    if ( properties.currChildren.items && properties.currChildren.items.length > 0) {
        Logger.log("beginning processFiles on currChildren");
        processFiles(properties.currChildren.items) 
        
    } 
    
    // when currChildren is complete, move on to other queries from properties.remaining
    Logger.log("beginning processFiles on next remaining folder");    
    while ( properties.remaining.length > 0 && !timeIsUp) {
        
        // if pages remained in the previous query, use them first
        if (properties.pageToken) {
            currFolder = properties.destFolder;
        } else {
            currFolder = properties.remaining.shift();
        }
        
        query = '"' + currFolder + '" in parents and trashed = false';
        
        do {
            
            // get files
            files = getFiles(query);
            
            // loop through and process
            if (files.items && files.items.length > 0) {
                
                processFiles(files.items);
                
            } else {
                
                Logger.log('No children found.');
                // todo: get next folder from properties.remaining
            }
            
            // get next page token to continue iteration
            properties.pageToken = files.nextPageToken;
            
        } while (properties.pageToken && !timeIsUp);
        
    
    }
    
    
    // if ( properties.errorFiles.length > 0 && !timeIsUp) {
    //     processFiles(properties.errorFiles);
    // }
    
    
    
    if ( timeIsUp ) {
        ss.getRange(ss.getLastRow()+1, 1, 1, 1).setValue("Paused due to Google quota limits - copy will resume in 2 minutes");
        saveState();     
    } else {
        // delete existing triggers and add Progress: Complete
        deleteTrigger(properties.triggerId);
        Drive.Files.delete(properties.propertiesDocId);
        ss.getRange(2, 3, 1, 1).setValue("Complete").setBackground("#66b22c");
        ss.getRange(2, 4, 1, 1).setValue(Utilities.formatDate(new Date(), timeZone, "MM-dd-yy hh:mm:ss a"));
    }
            
    
    
    return;
    
    
    
    /**
     * Loops through array of files.items
     * and sends to the appropriate copy function (insertFolder or copyFile)
     * 
     * @param {array} items the list of files over which to iterate
     */
    function processFiles(items) {
        while ( files.items.length > 0 && !timeIsUp ) {
            item = files.items.pop();
            Logger.log("items.length remaining = " + items.length);
            currTime = (new Date()).getTime();
            timeIsUp = (currTime - START_TIME >= MAX_RUNNING_TIME);
            
            
            // copy folder or file
            if ( item.mimeType == "application/vnd.google-apps.folder") {
                newfile = insertFolder(item);    
            } else {
                newfile = copyFile(item);
            }
            
            Logger.log("writing status to spreadsheet for newfile");
            // report success or failure on spreadsheet log
            if (newfile.id) {
                // sheet.getRange(row, column, numRows, numColumns) 
                ss.getRange(ss.getLastRow()+1, 1, 1, 5).setValues([[
                    "Copied",
                    newfile.title,
                    '=HYPERLINK("https://drive.google.com/open?id=' + newfile.id + '","'+ newfile.title + '")',
                    newfile.id, 
                    Utilities.formatDate(new Date(), timeZone, "MM-dd-yy hh:mm:ss aaa")
                ]]);    
                
            } else {
                // newfile is error
                ss.getRange(ss.getLastRow()+1, 1, 1, 5).setValues([[
                    "Error, " + newfile,
                    item.title,
                    '=HYPERLINK("https://drive.google.com/open?id=' + item.id + '","'+ item.title + '")',
                    item.id,
                    Utilities.formatDate(new Date(), timeZone, "MM-dd-yy hh:mm:ss aaa")
                ]]);
            }
            
            
        }
        return;
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
            
            
            properties.remaining.push(file.id);
            properties.map[file.id] = r.id;
            
            return r;
        }
        
        catch(err) {
            // properties.errorFiles.push(file);
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
            var r = Drive.Files.copy(
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
            return r;
        }
        
        catch(err) {
            // properties.errorFiles.push(file);
            Logger.log(err.message);
            return err;   
        }        
    }


    /**
     * Gets files from query and returns fileList with metadata
     * 
     * @param {string} query the query to select files from the Drive
     * @return {object} fileList object where fileList.items is an array of children files
     */
    function getFiles(query) {
        var fileList;
        
        fileList = Drive.Files.list({
                       q: query,
                       maxResults: 1000,
                       pageToken: properties.pageToken
                   });
            
        return fileList;    
    } 






    /**
     * copy permissions from source to destination file/folder
     * 
     * @param {string} srcId identification string for the source folder
     * @param {string} destId identification string for the destination folder
     * @param {string} filetype options: "file" or "folder", so know how to retrieve editors and viewers
         Maybe unnecessary since folders are treated as files in Advanced Drive API?     
     */
    function copyPermissions(srcId, destId, filetype) {
        var editors = 0;// get editors
        var viewers = 0;// get editors
        var owners = 0; // add owners to editors
        
        // these need adjustment based on my variable declarations
        if (editors.length > 0) {
            for (var i = 0; i < editorsemails.length; i++) {
                Drive.Permissions.insert(
                    {
                        'role': 'writer',
                        'type': 'user',
                        'value': editorsemails[i]
                    },
                    destId,
                    {
                        'sendNotificationEmails': 'false'
                    });
            }
        }
    
        if (viewers.length > 0) {
            for (var i = 0; i < viewersemails.length; i++) {
                Drive.Permissions.insert(
                    {
                        'role': 'reader',
                        'type': 'user',
                        'value': viewersemails[i]
                    },
                    destId, 
                    {
                        'sendNotificationEmails': 'false'
                    });
            }
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
        
        // save, create trigger
        properties.currChildren = files.items ? files : properties.currChildren;
        try {
            properties.destFolder = properties.currChildren.items[0].parents[0].id;
        } catch(err) {
            Logger.log("error: properties.destFolder = properties.currChildren.items[0].parents[0].id; " + err);
        }
        
        try {
            properties.destFolder = properties.currChildren.items[0].parents[0].id;
        } catch(err) {
            Logger.log("error: properties.pageToken = properties.currChildren.nextPageToken; " + err);    
        }
        
        
        saveProperties(properties, createTrigger);
        return;
    }











}