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
        propertiesDoc,  // {Object} metadata for Google Document created to hold properties
        userProperties, // {Object} instance of UserProperties object
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
    
    
    
    // create document for storing properties as plain text
    // this will be deleted upon script completion
    try {
        propertiesDoc = Drive.Files.insert({
            "description": "This document will be deleted after the folder copy is complete.  It is only used to store properties necessary to complete the copying procedure",
            "title": "DO NOT DELETE OR MODIFY - will be deleted after copying completes",
            "parents": [
                {
                    "kind": "drive#fileLink",
                    "id": destFolder.id
                }
            ],
            "mimeType": "application/vnd.google-apps.document"
        });   
    }
    catch(err) {
        Logger.log(err.message);
    }


    if (selectedFolder.permissions) {
        // Copy permissions of top-level folder
        copyPermissions(selectedFolder.srcId, null, destFolder.id);
    }


    
    // add link to destination folder to logger spreadsheet
    SpreadsheetApp.openById(spreadsheet.id).getSheetByName("Log").getRange(2,5).setValue('=HYPERLINK("https://drive.google.com/open?id=' + destFolder.id + '","'+ selectedFolder.destName + '")');
    
    

    // Get IDs of destination folder and logger spreadsheet 
    selectedFolder.destId = destFolder.id;
    selectedFolder.spreadsheetId = spreadsheet.id;
    selectedFolder.propertiesDocId = propertiesDoc.id;
    
    
    
    // initialize map with top level source and destination folder
    selectedFolder.leftovers = {}; // {Object} FileList object (returned from Files.list) for items not processed in prior execution (filled in saveState)
    selectedFolder.map = {};       // {Object} map of source ids (keys) to destination ids (values)
    selectedFolder.map[selectedFolder.srcId] = selectedFolder.destId;
    selectedFolder.remaining = [selectedFolder.srcId];

    
    
    
    // save srcId, destId, copyPermissions, spreadsheetId to userProperties
    userProperties = PropertiesService.getUserProperties();
    userProperties.setProperty("spreadsheetId", selectedFolder.spreadsheetId);
    userProperties.setProperty("propertiesDocId", selectedFolder.propertiesDocId);
    userProperties.setProperty("trials", 0);
    userProperties.setProperty("resuming", 'false');
    saveProperties(selectedFolder);
    
    
    return {
        spreadsheetId: selectedFolder.spreadsheetId,
        destId: selectedFolder.destId,
        resuming: false
    };
    
}


