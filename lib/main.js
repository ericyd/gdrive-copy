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
  var gDriveService = new GDriveService(),
    properties = new Properties(gDriveService),
    timer = new Timer(),
    ss, // {object} instance of Sheet class
    query, // {string} query to generate Files list
    fileList, // {object} list of files within Drive folder
    currFolder, // {object} metadata of folder whose children are currently being processed
    userProperties = PropertiesService.getUserProperties(), // reference to userProperties store
    triggerId = userProperties.getProperty('triggerId'), // {string} Unique ID for the most recently created trigger
    fileService = new FileService(gDriveService);

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
  try {
    ss = SpreadsheetApp.openById(properties.spreadsheetId).getSheetByName(
      'Log'
    );
  } catch (e) {
    try {
      ss = SpreadsheetApp.openById(
        PropertiesService.getUserProperties().getProperty('spreadsheetId')
      ).getSheetByName('Log');
    } catch (e) {
      // if the spreadsheet cannot be accessed, this should be considered a fatal error
      // and the script should not continue
      throw new Error('Cannot locate spreadsheet. Please try again.');
    }
  }

  // Create trigger for next run.
  // This trigger will be deleted if script finishes successfully
  // or if the stop flag is set.
  timer.update(userProperties);
  var duration = timer.calculateTriggerDuration(properties);
  TriggerService.createTrigger(duration);

  // Process leftover files from prior query results
  // that weren't processed before script timed out.
  // Destination folder must be set to the parent of the first leftover item.
  // The list of leftover items is an equivalent array to fileList returned from the getFiles() query
  if (
    properties.leftovers &&
    properties.leftovers.items &&
    properties.leftovers.items.length > 0
  ) {
    properties.destFolder = properties.leftovers.items[0].parents[0].id;
    fileService.processFileList(
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
      // TODO: This is throwing tons of errors but I don't know why.
      // for some reason properties.remaining is not being parsed correctly,
      // so it's a JSON stringy object instead of an actual array.
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
      if (fileList && fileList.items && fileList.items.length > 0) {
        fileService.processFileList(
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
      properties.pageToken = fileList ? fileList.nextPageToken : null;

      timer.update(userProperties);
    } while (properties.pageToken && timer.canContinue());
  }

  // Cleanup
  Util.cleanup(properties, fileList, userProperties, timer, ss, gDriveService);
}
