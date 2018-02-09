function GDriveService() {
  return this;
}



/**
 * Returns metadata for input file ID
 *
 * @param {string} id the folder ID for which to return metadata
 * @return {object} the permissions for the folder
 */
function getPermissions(id) {
  return Drive.Permissions.list(id);
}




/**
 * Gets files from query and returns fileList with metadata
 *
 * @param {string} query the query to select files from the Drive
 * @param {string} pageToken the pageToken (if any) for the existing query
 * @return {object} fileList object where fileList.items is an array of children files
 */
function getFiles(query, pageToken) {
  return Drive.Files.list({
    q: query,
    maxResults: 1000,
    pageToken: pageToken
  });
}




/**
 * Logs values to the logger spreadsheet
 *
 * @param {object} ss instance of Sheet class representing the logger spreadsheet
 * @param {Array} values array of values to be written to the spreadsheet
 */
function log(ss, values) {
  if (ss === null || ss === undefined) {
    ss = SpreadsheetApp.openById(
      PropertiesService.getUserProperties().getProperties().spreadsheetId
    ).getSheetByName('Log');
  }

  return ss
    .getRange(ss.getLastRow() + 1, 1, 1, values.length)
    .setValues([values]);
}




