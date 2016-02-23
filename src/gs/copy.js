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
        newfile;        // {Object} JSON metadata for newly created folder or file
        
        
    properties = loadProperties();
    
    
    // get current children, or if none exist, query next folder from properties.remaining
    // todo: in real instances, currChildre.items could exist but still have length = 0, in which case I would also want to skip
    // maybe initialize currChildren with properties items = [] , so I can test for length > 0 directly   ?
    if ( properties.currChildren.items ) {
        
    } else {
        
        
    }
    
    
    
    /*
    Note: pageToken will only be generated IF there are results on the next "page".  So I always want to test for it, but if it isn't present, then that's ok.  However, it can sort of be like my "continuationToken", maybe
    */
    // do {
    //     folders = Drive.Files.list({
    //         q: query,
    //         maxResults: 1000,
    //         pageToken: pageToken
    //     });
    //     if (folders.items && folders.items.length > 0) {
    //         for (var i = 0; i < folders.items.length; i++) {
    //             var folder = folders.items[i];
    //             Logger.log('%s (ID: %s)', folder.title, folder.id);
    //         }
    //     } else {
    //         Logger.log('No folders found.');
    //     }
    //     pageToken = folders.nextPageToken;
    // } while (pageToken);
    
    
    // get child folders from srcId
    var query = '"' + properties.srcId + '" in parents and trashed = false and ' +
        'mimeType = "application/vnd.google-apps.folder"';
        
    var folders, pageToken;
    
    folders = Drive.Files.list({
        q: query,
        maxResults: 1000,
        pageToken: pageToken
        //fields: items(id,kind,ownedByMe,owners,parents,permissions,title,userPermission,writersCanShare),kind,nextPageToken
    });
    
        
    
    
    
    
    // if no current objects exist to copy, get new ones
    if ( folders.items.length > 0 ) {
        
        for (var i = 0; i < folders.items.length; i ++) {
            
            if ( folders.items[i].mimeType == "application/vnd.google-apps.folder") {
                newfile = insertFolder(folders.items[i]);
                
            } else {
                newfile = copyFile(folders.items[i]);
                
            }
            
            Logger.log(newfile.id);
            
            
            //sheet.getRange(row, column, numRows, numColumns)
            //ss.getRange(2+i, 1, 1, 1).setValue(properties.srcChildFolders.items[i].id);
            ss.getRange(2+i, 1, 1, 1).setValue(i);
            ss.getRange(2+i, 2, 1, 1).setValue(newfile.id);
             
        }
        
        // stringify the JSON again before saving it
        properties.map = JSON.stringify(properties.map);
        
    }
    
    return;
    
    
    
    
    
    /**
     * Get userProperties for current users.
     * Get properties object from userProperties.
     * JSON.parse() and values that need parsing
     * 
     * @return {object} properties JSON object with current user's properties
     */
    function loadProperties() {
        var userProperties, properties;
        
        userProperties = PropertiesService.getUserProperties(); // {object} instance of Properties class
        properties = userProperties.getProperties();
        
        properties.map = JSON.parse(properties.map);
        properties.remaining = JSON.parse(properties.remaining);
        properties.currChildren = JSON.parse(properties.currChildren);
        
        ss = SpreadsheetApp.openById(properties.spreadsheetId).getSheetByName("Log");
        
        return properties;
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
        Logger.log("src parents id " + file.parents[0].id);
        Logger.log("typeof file.parents[0].id " + typeof file.parents[0].id);
        Logger.log("dest parents id " + properties.map[(file.parents[0].id).toString()]);
        
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
            
            Logger.log(r.id);
            
            return r;
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
            Logger.log(r.id);
            return r;
        }
        
        catch(err) {
            Logger.log(err.message);
            return err;   
        }        
    }
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