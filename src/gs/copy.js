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
        
        
    
    
    properties = loadProperties();
    Logger.log("properties loaded");    
    ss = SpreadsheetApp.openById(properties.spreadsheetId).getSheetByName("Log");
    timeZone = SpreadsheetApp.openById(properties.spreadsheetId).getSpreadsheetTimeZone();
    
    
    // get current children, or if none exist, query next folder from properties.remaining
    if ( properties.leftovers.items && properties.leftovers.items.length > 0) {
        Logger.log("beginning processFiles on leftovers");
        properties.destFolder = properties.leftovers.items[0].parents[0].id;
        processFiles(properties.leftovers.items) ;
        
    } 
    
    // when leftovers is complete, move on to other queries from properties.remaining
    Logger.log("beginning processFiles on next remaining folder");    
    while ( properties.remaining.length > 0 && !timeIsUp) {
        
        // if pages remained in the previous query, use them first
        if ( properties.pageToken ) {
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
            }
            
            // get next page token to continue iteration
            properties.pageToken = files.nextPageToken;
            
        } while (properties.pageToken && !timeIsUp);
        
    
    }
    
    
    
    if ( timeIsUp ) {
        ss.getRange(ss.getLastRow()+1, 1, 1, 1).setValue("Paused due to Google quota limits - copy will resume in about 1 minute");
        saveState();     
    } else {
        // delete existing triggers and add Progress: Complete
        if ( properties.triggerId !== undefined ) {
            // delete prior trigger
            deleteTrigger(properties.triggerId);    
        }
        Drive.Files.update({"labels": {"trashed": true}},properties.propertiesDocId);
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
            
            if (properties.permissions && item.permissions && newfile.id) {
                copyPermissions(item, newfile);
            }
            
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
     * @param {string} src metadata for the source folder
     * @param {string} dest metadata for the destination folder   
     */
    function copyPermissions(src, dest) {
        var permissions = src.permissions;
        var owners = src.permissions;
        var i;
        
        // copy editors, viewers, and commenters from src file to dest file
        if (permissions && permissions.length > 0){
            for (i = 0; i < permissions.length; i++) {
                
                // if there is no email address, it is only sharable by link.
                // These permissions will not include an email address, but they will include an ID
                // insert requests must include either value or id, thus the need to differentiate between permission types
                if (permissions[i].emailAddress) {
                    Drive.Permissions.insert(
                        {
                            "role": permissions[i].role,
                            "type": permissions[i].type,
                            "value": permissions[i].emailAddress,
                            "additionalRoles": permissions[i].additionalRoles ? [permissions[i].additionalRoles[0]] : []
                        },
                        dest.id,
                        {
                            'sendNotificationEmails': 'false'
                        });
                } else {
                    Drive.Permissions.insert(
                        {
                            "role": permissions[i].role,
                            "type": permissions[i].type,
                            "id": permissions[i].id,
                            "withLink": permissions[i].withLink,
                            "additionalRoles": permissions[i].additionalRoles ? [permissions[i].additionalRoles[0]] : []
                        },
                        dest.id,
                        {
                            'sendNotificationEmails': 'false'
                        });
                }
            }
        }
        
        
        // convert old owners to editors
        if (owners && owners.length > 0){
            for (i = 0; i < owners.length; i++) {
                Drive.Permissions.insert(
                    {
                        "role": "user",
                        "type": "writer",
                        "value": owners[i].emailAddress,
                    },
                    dest.id,
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
        
        // save, create trigger, and assign pageToken for continuation
        properties.leftovers = files && files.items ? files : properties.leftovers;
        properties.pageToken = properties.leftovers.nextPageToken;
        
        saveProperties(properties, createTrigger);
        return;
    }











}