function GDriveService() {
  this.ss = 'mySpreadsheetInstance';
  return this;
}

// STATIC METHODS
//============================

/**
 * Returns metadata for input file ID
 *
 * @param {string} id the folder ID for which to return metadata
 * @return {object} the permissions for the folder
 */
GDriveService.getPermissions = function(id) {
  return Drive.Permissions.list(id);
};

/**
 * Gets files from query and returns fileList with metadata
 * @param {string} query the query to select files from the Drive
 * @param {string} pageToken the pageToken (if any) for the existing query
 * @return {object} fileList object where fileList.items is an array of children files
 */
GDriveService.getFiles = function(query, pageToken) {
  return Drive.Files.list({
    q: query,
    maxResults: 1000,
    pageToken: pageToken
  });
};

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

// Get properties from propertiesDoc. FileID for propertiesDoc is saved in userProperties
GDriveService.getPropertiesDoc = function() {
  return DriveApp.getFileById(
    PropertiesService.getUserProperties().getProperties().propertiesDocId
  ).getAs(MimeType.PLAIN_TEXT);
};

GDriveService.setPropertiesDoc = function(properties) {
  return DriveApp.getFileById(
    PropertiesService.getUserProperties().getProperties().propertiesDocId
  ).setContent(JSON.stringify(properties));
};

GDriveService.insertFolder = function(body) {
  return Drive.Files.insert(body);
};

GDriveService.insertBlankFile = function(parentID) {
  return DriveApp.getFolderById(parentID).createFile(
    'DO NOT DELETE OR MODIFY - will be deleted after copying completes',
    '',
    MimeType.PLAIN_TEXT
  );
};

GDriveService.copyFile = function(body, id) {
  return Drive.Files.copy(body, id);
};

GDriveService.insertPermission = function(body, id, options) {
  return Drive.Permissions.insert(body, id, options);
};

GDriveService.removePermission = function(fileID, permissionID) {
  return Drive.Permissions.remove(fileID, permissionID);
};

GDriveService.getRootID = function() {
  return DriveApp.getRootFolder().getId();
};

//removeIf(production)
// Google Apps Script doesn't play well with module.exports,
// but it is required for testing
module.exports = GDriveService;
//endRemoveIf(production)
