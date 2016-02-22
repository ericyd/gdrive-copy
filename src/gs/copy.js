/**
 * Copy folders and files from source to destination.
 * Get parameters from userProperties,
 * Loop until time runs out,
 * then call timeout methods, saveProperties and createTrigger.
 */
function copy() {
    Logger.log("copy called");
    
    var timeIsUp,       // {boolean} true if max execution time is reached while executing script
        permissions,    // {boolean} true if sharing permissions should be copied from source to destination
        currTime,       // {number} integer representing current time in milliseconds
        copyObject,     // {object} all the files and folders to copy
        srcId,          // {string} identification for top level source folder
        destId,         // {string} identification for top level destination folder
        ss,             // {object} instance of Sheet class
        properties,     // {object} properties of current run
        userProperties = PropertiesService.getUserProperties(); // {object} instance of Properties class
        
    properties = userProperties.getProperties();
    
    
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
    
        
    
    var MAX_RUNNING_TIME = 5.7 * 60 * 1000;   // 5.7 minutes in milliseconds
    var START_TIME = (new Date()).getTime();
    
    for (var key in properties) {
        Logger.log('key: ' + key + ", value: " + properties[key]);
    }
    
    ss = SpreadsheetApp.openById(properties.spreadsheetId).getSheetByName("Log");
    
    // if no current objects exist to copy, get new ones
    if ( folders.items.length > 0 ) {
        
        for (var i = 0; i < folders.items.length; i ++) {
            //sheet.getRange(row, column, numRows, numColumns)
             //ss.getRange(2+i, 1, 1, 1).setValue(properties.srcChildFolders.items[i].id);
             ss.getRange(2+i, 1, 1, 1).setValue(i);
             ss.getRange(2+i, 2, 1, 1).setValue(folders.items[i].id);
             
        }
        
    }
    
    return;
    
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