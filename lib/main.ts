/**********************************************
 * Main copy loop
 **********************************************/

import FileService from './FileService';
import GDriveService from './GDriveService';
import Util from './Util';
import Properties from './Properties';
import Timer from './Timer';
import TriggerService from './TriggerService';
import {
  doGet,
  initialize,
  getMetadata,
  getUserEmail,
  resume,
  setStopFlag,
  deleteAllTriggers,
  getTriggersQuantity,
  getOAuthToken
} from './public';

/**
 * Copy folders and files from source to destination.
 * Get parameters from userProperties,
 * Loop until time runs out,
 * then call timeout methods, save and createTrigger.
 *
 * @param {boolean} resuming whether or not the copy call is resuming an existing folder copy or starting fresh
 */
function copy() {
  // initialize vars
  var gDriveService = new GDriveService(),
    properties = new Properties(gDriveService),
    timer = new Timer(),
    ss, // {object} instance of Sheet class
    query, // {string} query to generate Files list
    fileList, // {object} list of files within Drive folder
    currFolder, // {object} metadata of folder whose children are currently being processed
    userProperties = PropertiesService.getUserProperties(), // reference to userProperties store
    triggerId = userProperties.getProperty('triggerId'), // {string} Unique ID for the most recently created trigger
    fileService = new FileService(gDriveService, timer, properties);

  // Delete previous trigger
  TriggerService.deleteTrigger(triggerId);

  // Load properties.
  // If loading properties fails, return the function and
  // set a trigger to retry in 6 minutes.
  try {
    Util.exponentialBackoff(
      properties.load.bind(properties),
      'Error restarting script, trying again...'
    );
  } catch (e) {
    var n = Number(userProperties.getProperties().trials);
    Logger.log(n);

    if (n < 5) {
      Logger.log('setting trials property');
      userProperties.setProperty('trials', (n + 1).toString());

      Util.exponentialBackoff(
        TriggerService.createTrigger,
        'Error setting trigger.  There has been a server error with Google Apps Script.' +
          'To successfully finish copying, please refresh the app and click "Resume Copying"' +
          'and follow the instructions on the page.'
      );
    }
    return;
  }

  // Initialize logger spreadsheet
  ss = gDriveService.openSpreadsheet(properties.spreadsheetId);

  // Create trigger for next run.
  // This trigger will be deleted if script finishes successfully
  // or if the stop flag is set.
  timer.update(userProperties);
  var duration = timer.calculateTriggerDuration(properties);
  TriggerService.createTrigger(duration);

  // Process leftover files from prior query results
  fileService.handleLeftovers(userProperties, ss);

  // Update current runtime and user stop flag
  timer.update(userProperties);

  // When leftovers are complete, query next folder from properties.remaining
  while (
    (properties.remaining.length > 0 || Util.isSome(properties.pageToken)) &&
    timer.canContinue()
  ) {
    // if pages remained in the previous query, use them first
    if (properties.pageToken && properties.currFolderId) {
      currFolder = properties.currFolderId;
    } else {
      try {
        currFolder = properties.remaining.shift();
      } catch (e) {
        console.error('properties.remaining is not parsed correctly');
        console.error(e);
        properties.remaining = JSON.parse(properties.remaining);
        currFolder = properties.remaining.shift();
      }
    }

    // build query
    query = '"' + currFolder + '" in parents and trashed = false';

    // Query Drive to get the fileList (children) of the current folder, currFolder
    // Repeat if pageToken exists (i.e. more than 1000 results return from the query)
    do {
      try {
        fileList = gDriveService.getFiles(query, properties.pageToken);
      } catch (e) {
        Util.log(ss, Util.composeErrorMsg(e));
      }
      if (!fileList) {
        console.log('fileList is undefined. currFolder:', currFolder);
      }

      // Send items to processFileList() to copy if there is anything to copy
      if (Util.hasSome(fileList, 'items')) {
        fileService.processFileList(fileList.items, userProperties, ss);
      } else {
        Logger.log('No children found.');
      }

      // get next page token to continue iteration
      properties.pageToken = fileList ? fileList.nextPageToken : null;

      timer.update(userProperties);
    } while (properties.pageToken && timer.canContinue());
  }

  // Retry files that errored during initial run
  fileService.handleRetries(userProperties, ss);

  // Cleanup
  Util.cleanup(properties, fileList, userProperties, timer, ss, gDriveService);
}

export {
  doGet,
  initialize,
  getMetadata,
  getUserEmail,
  resume,
  setStopFlag,
  deleteAllTriggers,
  getTriggersQuantity,
  getOAuthToken,
  copy
};
