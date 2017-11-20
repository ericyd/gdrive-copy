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
  return template
    .evaluate()
    .setTitle('Copy a Google Drive folder')
    .setSandboxMode(HtmlService.SandboxMode.IFRAME);
}

/**
 * Initialize destination folder, logger spreadsheet, and properties doc.
 * Build/add properties to options so it can be saved to the properties doc.
 * Set UserProperties values and save properties to propertiesDoc.
 * Add link for destination folder to logger spreadsheet.
 * Return IDs of created destination folder and logger spreadsheet
 *
 * @param {object} options
 *  {
 *    srcFolderID: string,
 *    srcParentId: string,
 *    srcFolderName: string,
 *    srcFolderURL: string,
 *    destFolderName: string,
 *    copyPermissions: boolean,
 *    copytoRoot: boolean
 *  }
 */
function initialize(options) {
  /*****************************
   * Declare variables used in project initialization
   */
  var destFolder, // {Object} instance of Folder class representing destination folder
    spreadsheet, // {Object} instance of Spreadsheet class
    propertiesDocId, // {Object} metadata for Google Document created to hold properties
    today = Utilities.formatDate(new Date(), 'GMT-5', 'MM-dd-yyyy'); // {string} date of copy

  /*****************************
   * Create Files used in copy process
   */
  destFolder = initializeDestinationFolder(options, today);

  spreadsheet = createLoggerSpreadsheet(today, destFolder.id);

  propertiesDocId = createPropertiesDocument(destFolder.id);

  /*****************************
   * Build/add properties to options so it can be saved to the properties doc
   */
  options.destId = destFolder.id;
  options.spreadsheetId = spreadsheet.id;
  options.propertiesDocId = propertiesDocId;

  // initialize map with top level source and destination folder
  options.leftovers = {}; // {Object} FileList object (returned from Files.list) for items not processed in prior execution (filled in saveState)
  options.map = {}; // {Object} map of source ids (keys) to destination ids (values)
  options.map[options.srcFolderID] = options.destId;
  options.remaining = [options.srcFolderID];

  /*****************************
   * Set UserProperties values and save properties to propertiesDoc
   */
  setUserPropertiesStore(
    options.spreadsheetId,
    options.propertiesDocId,
    options.destId,
    'false'
  );
  saveProperties(options);

  /*****************************
   * Add link for destination folder to logger spreadsheet
   */
  SpreadsheetApp.openById(spreadsheet.id)
    .getSheetByName('Log')
    .getRange(2, 5)
    .setValue(
      '=HYPERLINK("https://drive.google.com/open?id=' +
        destFolder.id +
        '","' +
        options.destFolderName +
        '")'
    );

  /*****************************
   * Return IDs of created destination folder and logger spreadsheet
   */
  return {
    spreadsheetId: options.spreadsheetId,
    destId: options.destId,
    resuming: false
  };
}
