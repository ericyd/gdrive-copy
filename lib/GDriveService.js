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
GDriveService.log = function(ss, values) {
  if (ss === null || ss === undefined) {
    ss = SpreadsheetApp.openById(
      PropertiesService.getUserProperties().getProperties().spreadsheetId
    ).getSheetByName('Log');
  }

  return ss
    .getRange(ss.getLastRow() + 1, 1, 1, values.length)
    .setValues([values]);
};

/**
 * Download contents of file
 * @param {string} id 
 */
GDriveService.downloadFile = function(id) {
  return Drive.Files.get(id, {alt: "media"});
}

/**
 * Updates a file's content and metadata
 * @param {Object} metadata 
 * @param {string} fileID 
 * @param {Blob} mediaData 
 */
GDriveService.updateFile = function(metadata, fileID, mediaData) {
  return Drive.Files.update(metadata, fileID, mediaData);
}

GDriveService.insertFolder = function(body) {
  return Drive.Files.insert(body);
};

GDriveService.insertBlankFile = function(parentID) {
  return GDriveService.insertFolder({
    description: 'This document will be deleted after the folder copy is complete. It is only used to store properties necessary to complete the copying procedure',
    title: 'DO NOT DELETE OR MODIFY - will be deleted after copying completes',
    parents: [
      {
        kind: 'drive#fileLink',
        id: parentID
      }
    ],
    mimeType: 'text/plain' // maybe application/json ?
  });
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
