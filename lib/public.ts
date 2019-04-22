/**********************************************
 * These functions are called from the front end via
 * google.script.run
 *
 * They need to be globally available so the calls work as expected
 **********************************************/

import GDriveService from './GDriveService';
import FileService from './FileService';
import Properties from './Properties';
import Timer from './Timer';
import Constants from './Constants';
import ErrorMessages from './ErrorMessages';

/**
 * Serves HTML of the application for HTTP GET requests.
 * If folderId is provided as a URL parameter, the web app will list
 * the contents of that folder (if permissions allow). Otherwise
 * the web app will list the contents of the root folder.
 *
 * @param {Object} e event parameter that can contain information
 *     about any URL parameters provided.
 */
export function doGet(e) {
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
 */
export function initialize(
  options: FrontEndOptions
): {
  spreadsheetId: string;
  destFolderId: string;
  resuming: boolean;
} {
  var destFolder, // {Object} instance of Folder class representing destination folder
    spreadsheet: gapi.client.drive.FileResource,
    propertiesDocId: string,
    today: string = Utilities.formatDate(new Date(), 'GMT-5', 'MM-dd-yyyy'),
    gDriveService = new GDriveService(),
    timer = new Timer(),
    properties = new Properties(gDriveService),
    fileService = new FileService(gDriveService, timer, properties);

  // Create Files used in copy process
  destFolder = fileService.initializeDestinationFolder(options, today);
  spreadsheet = fileService.createLoggerSpreadsheet(today, destFolder.id);
  propertiesDocId = fileService.createPropertiesDocument(destFolder.id);

  // Build/add properties to options so it can be saved to the properties doc
  options.destId = destFolder.id;
  options.spreadsheetId = spreadsheet.id;
  options.propertiesDocId = propertiesDocId;

  // initialize map with top level source and destination folder
  options.map = {};
  options.map[options.srcFolderID] = options.destId;
  options.remaining = [options.srcFolderID];

  // Add link for destination folder to logger spreadsheet
  try {
    SpreadsheetApp.openById(spreadsheet.id)
      .getSheetByName('Log')
      .getRange(2, 5)
      .setValue(
        FileService.getFileLinkForSheet(destFolder.id, options.destFolderName)
      );
  } catch (e) {
    console.error('unable to set folder URL in copy log');
    console.error(e);
  }

  // 2018-09-06: this often throws a "Bad Value" error, not sure of the cause
  // but this data is low importance
  try {
    options.timeZone = SpreadsheetApp.openById(
      spreadsheet.id
    ).getSpreadsheetTimeZone();
  } catch (e) {
    options.timeZone = 'GMT-7';
  }

  // Adding a row to status list prevents weird style copying when logging
  try {
    SpreadsheetApp.openById(spreadsheet.id)
      .getSheetByName('Log')
      .getRange(5, 1, 1, 5)
      .setValues([
        [
          Constants.StartCopyingText,
          '',
          '',
          '',
          Utilities.formatDate(
            new Date(),
            options.timeZone,
            'MM-dd-yy hh:mm:ss aaa'
          )
        ]
      ]);
  } catch (e) {
    console.error('unable to write "started copying"');
    console.error(e);
  }

  // Set UserProperties values and save properties to propertiesDoc
  Properties.setUserPropertiesStore(
    options.spreadsheetId,
    options.propertiesDocId,
    options.destId,
    'false'
  );
  Properties.save(options, gDriveService);

  // Delete all existing triggers so no scripts overlap
  deleteAllTriggers();

  // Return IDs of created destination folder and logger spreadsheet
  return {
    spreadsheetId: options.spreadsheetId,
    destFolderId: options.destId,
    resuming: false
  };
}

export function getMetadata(
  id: string,
  url?: string
): gapi.client.drive.FileResource {
  try {
    return Drive.Files.get(id);
  } catch (e) {
    throw new Error(ErrorMessages.NotFound(url));
  }
}

export function getUserEmail(): string {
  return Session.getActiveUser().getEmail();
}

/**
 * Find prior copy folder instance.
 * Find propertiesDoc and logger spreadsheet, and save IDs to userProperties, which will be used by load.
 */
export function resume(
  options: FrontEndOptions
): { spreadsheetId: string; destFolderId: string; resuming: boolean } {
  var gDriveService = new GDriveService(),
    timer = new Timer(),
    properties = new Properties(gDriveService),
    fileService = new FileService(gDriveService, timer, properties);
  var priorCopy = fileService.findPriorCopy(options.srcFolderID);

  Properties.setUserPropertiesStore(
    priorCopy.spreadsheetId,
    priorCopy.propertiesDocId,
    options.destFolderId,
    'true'
  );

  return {
    spreadsheetId: priorCopy.spreadsheetId,
    destFolderId: options.srcFolderID,
    resuming: true
  };
}

/**
 * Set a flag in the userProperties store that will cancel the current copy folder process
 */
export function setStopFlag(): GoogleAppsScript.Properties.Properties {
  return PropertiesService.getUserProperties().setProperty('stop', 'true');
}

/**
 * Loop over all triggers and delete
 */
export function deleteAllTriggers() {
  var allTriggers = ScriptApp.getProjectTriggers();
  for (var i = 0; i < allTriggers.length; i++) {
    ScriptApp.deleteTrigger(allTriggers[i]);
  }
}

/**
 * @return {number} number of active triggers for this user
 */
export function getTriggersQuantity() {
  return ScriptApp.getProjectTriggers().length;
}

/**
 * @returns {string} token for use with Google Picker
 */
export function getOAuthToken() {
  return ScriptApp.getOAuthToken();
}
