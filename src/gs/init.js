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
        map = {},       // {Object} map of source ids (keys) to destination ids (values)
        remaining = [], // {Array} list of folder IDs that still need to be processed
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
    
    
    
    // initialize mapToDest with top level source and destination folder
    map[selectedFolder.srcId] = selectedFolder.destId;
    remaining.push(selectedFolder.srcId);

    selectedFolder.map = JSON.stringify(map);
    selectedFolder.remaining = JSON.stringify(remaining);
    selectedFolder.currChildren = JSON.stringify({});
    
    
    
    // save srcId, destId, copyPermissions, spreadsheetId to userProperties
    saveProperties(selectedFolder);
    
    // create trigger to call copy() in X seconds
    
    /*
    
    BRING THIS BACK FOR FINAL IMPLEMENTATION
    
    */
    //createTrigger(2);
    
    
    return {
        spreadsheetId: selectedFolder.spreadsheetId,
        destId: selectedFolder.destId
    };
    
}


