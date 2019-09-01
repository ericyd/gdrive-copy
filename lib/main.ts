/**********************************************
 * Main copy loop
 **********************************************/

import FileService from './FileService';
import GDriveService from './GDriveService';
import Util from './Util';
import Properties from './Properties';
import Timer from './Timer';
import TriggerService from './TriggerService';
import ErrorMessages from './ErrorMessages';
import Logging from './Logging';

/**
 * Copy folders and files from source to destination.
 * Get parameters from userProperties,
 * Loop until time runs out,
 * then call timeout methods, save and createTrigger.
 */
export function copy(): void {
  // initialize vars
  var gDriveService: GDriveService = new GDriveService(),
    properties: Properties = new Properties(gDriveService),
    timer: Timer = new Timer(),
    ss: GoogleAppsScript.Spreadsheet.Sheet,
    query: string,
    fileList: gapi.client.drive.FileListResource,
    currFolder: string,
    userProperties: GoogleAppsScript.Properties.UserProperties = PropertiesService.getUserProperties(), // reference to userProperties store
    triggerId: string = userProperties.getProperty('triggerId'), // {string} Unique ID for the most recently created trigger
    fileService: FileService = new FileService(
      gDriveService,
      timer,
      properties
    );

  // Delete previous trigger
  TriggerService.deleteTrigger(triggerId);

  // Load properties.
  // If loading properties fails, return the function and
  // set a trigger to retry in 6 minutes.
  try {
    Util.exponentialBackoff(
      properties.load.bind(properties),
      ErrorMessages.Restarting
    );
  } catch (e) {
    var n = Number(userProperties.getProperties().trials);
    Logger.log(n);

    if (n < 5) {
      Logger.log('setting trials property');
      userProperties.setProperty('trials', (n + 1).toString());

      Util.exponentialBackoff(
        TriggerService.createTrigger,
        ErrorMessages.SettingTrigger
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
        console.error(ErrorMessages.ParseErrorRemaining);
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
        Logging.log({ ss, status: Util.composeErrorMsg(e) });
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
