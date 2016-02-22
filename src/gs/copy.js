//todo: delete trigger after it runs - there is a max for the script









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
    ss = SpreadsheetApp.openById(properties.spreadsheetId).getSheetByName("Log");
    
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
    
    // for (var key in properties) {
    //     Logger.log('key: ' + key + ", value: " + properties[key]);
    // }
    
    
    
    // if no current objects exist to copy, get new ones
    if ( folders.items.length > 0 ) {
        
        for (var i = 0; i < folders.items.length; i ++) {
            Logger.log("in for loop");
            // Drive.Files.copy({
            //         "fileId": folders.items[i].id,
            //         "resource": {
            //             "description": folders.items[i].description,
            //             "parents": [
            //                 {
            //                     "id": properties.destId // parent of DESTINATION folder...this will be harder to get...    
            //                 } 
            //             ],
            //             // is this all I need to copy permissions?
            //             "permissions": folders.items[i].permissions
            //             
            //         }
            //     });
            
            
            try {
                var r = Drive.Files.insert({
                    "title": folders.items[i].title,
                    "parents": [
                        {
                            "kind": "drive#fileLink",
                            "id": properties.destId
                        }
                    ],
                    "mimeType": "application/vnd.google-apps.folder"
                });
                

                Logger.log("destId: " + properties.destId);
                Logger.log("inserted a file, wrong mimetype id = " + r.id);
                ss.getRange(2+i, 3, 1, 1).setValue("inserted a folder, no request variable");
            }
            catch(err) {
                Logger.log("inserted a file, wrong mimetype");
                Logger.log(err.message);
                ss.getRange(2+i, 3, 1, 1).setValue("error " + err.message);
            }
            
            try {
                var r = Drive.Files.copy(folders.items[i].id, {
                    "title": folders.items[i].title,
                    "parents": [
                        {
                            "kind": "drive#fileLink",
                            "id": properties.destId
                        }
                    ],
                    "mimeType": "application/vnd.google-apps.folder"
                }
                );
                

                Logger.log("copying with similar to insert " + r.id);
                ss.getRange(2+i, 6, 1, 1).setValue("copied similar to insert");
            }
            catch(err) {
                Logger.log("copying with similar to insert");
                Logger.log(err.message);
                ss.getRange(2+i, 6, 1, 1).setValue("error " + err.message);
            }
            
            
            try {
                var r = Drive.Files.copy({
                    "params": {
                        "fileId": folders.items[i].id
                    },
                    "body": {
                        "title": folders.items[i].title,
                        "parents": [
                            {
                                "id": properties.destId
                            }
                        ],
                        "mimeType": "application/vnd.google-apps.folder"
                    }
                });
                
                Logger.log("params property, body instead of request");
                ss.getRange(2+i, 5, 1, 1).setValue("copied a file");
            }
            catch(err) {
                Logger.log("params property, body instead of request");
                Logger.log(err.message);
                ss.getRange(2+i, 5, 1, 1).setValue("error " + err.message);
            }
            
            
            try {
                Drive.Files.copy(folders.items[i].id,
                    {
                        "parents": [
                            {
                                "id": properties.destId
                            }
                        ]
                    }
                );
                Logger.log("pass individual arguments, not object")
            } catch(err) {
                Logger.log("pass individual arguments, not object")
                Logger.log(err.message);
            }
            
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