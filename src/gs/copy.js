//todo: delete trigger after it runs - there is a max for the script









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
        timeIsUp = false; // {boolean}
        
        
        
    properties = loadProperties();
    
    
    
    // get current children, or if none exist, query next folder from properties.remaining
    if ( properties.currChildren.items && properties.currChildren.items.length > 0) {
        
        processFiles(properties.currChildren.items) 
        
    } 
    
    // when currChildren is complete, move on to other queries from properties.remaining
        
    while ( properties.remaining.length > 0 && !timeIsUp) {
        
        currFolder = properties.remaining.shift();
        query = '"' + currFolder + '" in parents and trashed = false';
        // Note: pageToken will only be generated IF there are results on the next "page".  So I always want to test for it, but if it isn't present, then that's ok.  However, it can sort of be like my "continuationToken", maybe
        
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
    
    
    if ( timeIsUp ) {
        saveState();     
    } else {
        deleteTrigger(properties.triggerId);
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
            currTime = (new Date()).getTime();
            timeIsUp = (currTime - START_TIME >= MAX_RUNNING_TIME);
            
            
            if ( item.mimeType == "application/vnd.google-apps.folder") {
                newfile = insertFolder(item);    
            } else {
                newfile = copyFile(folders.items[i]);
            }
            
            
            if (newfile.id) {
                // sheet.getRange(row, column, numRows, numColumns) 
                ss.getRange(ss.getLastRow(), 1, 1, 3).setValues([
                    "Copied",
                    newfile.id, 
                    newfile.title,
                    newfile.defaultOpenWithLink,
                    Utilities.formatDate(new Date(), "GMT-5", "MM-dd-yy hh:mm a")
                ]);    
                
            } else {
                // newfile is error message
                ss.getRange(ss.getLastRow(), 1, 1, 2).setValue([
                    "Error",
                    newfile
                ]);
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
            
             
            properties.remaining.push(r.id);
            
            return;
        }
        
        catch(err) {
            Logger.log(err.message);
            return err.message;
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
        saveProperties(properties, createTrigger);
        return;
    }











}