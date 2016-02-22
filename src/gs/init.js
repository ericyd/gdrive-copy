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
    
    
    // Get IDs of destination folder and logger spreadsheet 
    selectedFolder.destId = destFolder.id;
    selectedFolder.spreadsheetId = spreadsheet.id;
    
    
   
    // 
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
    
    
    // save srcId, destId, copyPermissions, spreadsheetId to userProperties
    saveProperties(selectedFolder);
    
    // create trigger to call copy() in X seconds
    createTrigger(2);
    
    
    return {
        spreadsheetId: selectedFolder.spreadsheetId,
        destId: selectedFolder.destId
    };
    
}


