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
  
  // Build and return HTML in IFRAME sandbox mode.
  return template.evaluate()
      .setTitle('Copy a Google Drive folder')
      .setSandboxMode(HtmlService.SandboxMode.IFRAME);
}




/**
 * Initialize destination folder, logger spreadsheet, and properties doc.
 * Build/add properties to selectedFolder so it can be saved to the properties doc.
 * Set UserProperties values and save properties to propertiesDoc.
 * Add link for destination folder to logger spreadsheet.
 * Return IDs of created destination folder and logger spreadsheet
 * 
 * @param {object} selectedFolder contains srcId, srcParentId, destName, permissions, srcName
 */
function initialize(selectedFolder) {

    /*****************************
     * Declare variables used in project initialization 
     */
    var destFolder,     // {Object} instance of Folder class representing destination folder
        spreadsheet,    // {Object} instance of Spreadsheet class
        propertiesDocId,  // {Object} metadata for Google Document created to hold properties
        today = Utilities.formatDate(new Date(), "GMT-5", "MM-dd-yyyy"); // {string} date of copy
    

    /*****************************
     * Create Files used in copy process
     */
    destFolder = initializeDestinationFolder(selectedFolder, today);

    spreadsheet = createLoggerSpreadsheet(today, destFolder.id);

    propertiesDocId = createPropertiesDocument(destFolder.id);

    

    
    /*****************************
     * Build/add properties to selectedFolder so it can be saved to the properties doc
     */
    selectedFolder.destId = destFolder.id;
    selectedFolder.spreadsheetId = spreadsheet.id;
    selectedFolder.propertiesDocId = propertiesDocId;

    // initialize map with top level source and destination folder
    selectedFolder.leftovers = {}; // {Object} FileList object (returned from Files.list) for items not processed in prior execution (filled in saveState)
    selectedFolder.map = {};       // {Object} map of source ids (keys) to destination ids (values)
    selectedFolder.map[selectedFolder.srcId] = selectedFolder.destId;
    selectedFolder.remaining = [selectedFolder.srcId];

    
    

    /*****************************
     * Set UserProperties values and save properties to propertiesDoc
     */
    setUserPropertiesStore(selectedFolder.spreadsheetId, selectedFolder.propertiesDocId, selectedFolder.destId, "false");
    saveProperties(selectedFolder);




    /*****************************
     * Add link for destination folder to logger spreadsheet
     */
    SpreadsheetApp.openById(spreadsheet.id).getSheetByName("Log").getRange(2,5).setValue('=HYPERLINK("https://drive.google.com/open?id=' + destFolder.id + '","'+ selectedFolder.destName + '")');
    

    

    /*****************************
     * Return IDs of created destination folder and logger spreadsheet
     */
    return {
        spreadsheetId: selectedFolder.spreadsheetId,
        destId: selectedFolder.destId,
        resuming: false
    };
    
}


