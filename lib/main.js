/**********************************************
 * Main copy loop
 **********************************************/

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
  var properties = new Properties(),
    timer = new Timer(),
    ss, // {object} instance of Sheet class
    query, // {string} query to generate Files list
    fileList, // {object} list of files within Drive folder
    currFolder, // {object} metadata of folder whose children are currently being processed
    userProperties = PropertiesService.getUserProperties(), // reference to userProperties store
    triggerId = userProperties.getProperty('triggerId'); // {string} Unique ID for the most recently created trigger

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

  // Determine if script has exceeded max daily runtime
  // If yes, need to sleep for one day to avoid throwing "Script using too much computer time" error
  properties.maxRuntimeExceeded =
    properties.totalRuntime + Timer.MAX_RUNTIME >= Timer.MAX_RUNTIME_PER_DAY;
  timer.update(userProperties);

  // Create trigger for next run.
  // This trigger will be deleted if script finishes successfully
  // or if the stop flag is set.
  var duration = properties.maxRuntimeExceeded
    ? Timer.oneDay
    : Timer.sixMinutes - timer.runtime;
  TriggerService.createTrigger(duration);

  // Initialize logger spreadsheet
  ss = SpreadsheetApp.openById(properties.spreadsheetId).getSheetByName('Log');

  // Process leftover files from prior query results
  // that weren't processed before script timed out.
  // Destination folder must be set to the parent of the first leftover item.
  // The list of leftover items is an equivalent array to fileList returned from the getFiles() query
  if (properties.leftovers.items && properties.leftovers.items.length > 0) {
    properties.destFolder = properties.leftovers.items[0].parents[0].id;
    FileService.processFileList(
      properties.leftovers.items,
      properties,
      userProperties,
      timer,
      ss
    );
  }

  // Update current runtime and user stop flag
  timer.update(userProperties);

  // When leftovers are complete, query next folder from properties.remaining
  while (properties.remaining.length > 0 && timer.canContinue()) {
    // if pages remained in the previous query, use them first
    if (properties.pageToken) {
      currFolder = properties.destFolder;
    } else {
      currFolder = properties.remaining.shift();
    }

    // build query
    query = '"' + currFolder + '" in parents and trashed = false';

    // Query Drive to get the fileList (children) of the current folder, currFolder
    // Repeat if pageToken exists (i.e. more than 1000 results return from the query)
    do {
      try {
        fileList = GDriveService.getFiles(query, properties.pageToken);
      } catch (e) {
        Util.log(ss, Util.composeErrorMsg(e));
      }

      // Send items to processFileList() to copy if there is anything to copy
      if (fileList.items && fileList.items.length > 0) {
        FileService.processFileList(
          fileList.items,
          properties,
          userProperties,
          timer,
          ss
        );
      } else {
        Logger.log('No children found.');
      }

      // get next page token to continue iteration
      properties.pageToken = fileList.nextPageToken;

      timer.update(userProperties);
    } while (properties.pageToken && timer.canContinue());
  }

  // Cleanup
  Util.cleanup(properties, fileList, userProperties, timer, ss);
}
