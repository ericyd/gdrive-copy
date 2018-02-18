/**********************************************
 * Main copy loop
 **********************************************/

/**
 * Copy folders and files from source to destination.
 * Get parameters from userProperties,
 * Loop until time runs out,
 * then call timeout methods, saveProperties and createTrigger.
 *
 * @param {boolean} resuming whether or not the copy call is resuming an existing folder copy or starting fresh
 */
function copy() {
  // initialize objects
  var fileService = new FileService();
  var gDriveService = new GDriveService();
  var properties = new Properties(PropertiesService);
  var timer = new Timer();
  var triggerService = new TriggerService();

  var ss, // {object} instance of Sheet class
    query, // {string} query to generate Files list
    fileList, // {object} list of files within Drive folder
    currFolder, // {object} metadata of folder whose children are currently being processed
    timeZone, // {string} time zone of user
    userProperties = PropertiesService.getUserProperties(), // reference to userProperties store
    triggerId = userProperties.getProperties().triggerId; // {string} Unique ID for the most recently created trigger

  /*****************************
   * Delete previous trigger
   */
  TriggerService.deleteTrigger(triggerId);

  /*****************************
   * Create trigger for next run.
   * This trigger will be deleted if script finishes successfully
   * or if the stop flag is set.
   */
  TriggerService.createTrigger();

  /*****************************
   * Load properties.
   * If loading properties fails, return the function and
   * set a trigger to retry in 6 minutes.
   */
  try {
    Util.exponentialBackoff(
      properties.loadProperties,
      'Error restarting script, trying again...'
    );
  } catch (err) {
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

  /*****************************
   * Initialize logger spreadsheet and timeZone
   */

  ss = SpreadsheetApp.openById(properties.spreadsheetId).getSheetByName('Log');
  timeZone = SpreadsheetApp.openById(
    properties.spreadsheetId
  ).getSpreadsheetTimeZone();
  if (timeZone === undefined || timeZone === null) {
    timeZone = 'GMT-7';
  }

  /*****************************
   * Process leftover files from prior query results
   * that weren't processed before script timed out.
   * Destination folder must be set to the parent of the first leftover item.
   * The list of leftover items is an equivalent array to fileList returned from the getFiles() query
   */
  if (properties.leftovers.items && properties.leftovers.items.length > 0) {
    properties.destFolder = properties.leftovers.items[0].parents[0].id;
    processFileList(
      properties.leftovers.items,
      timeZone,
      properties.copyPermissions,
      userProperties,
      timer,
      properties.map,
      ss,
      properties
    );
  }

  /*****************************
   * Update current runtime and user stop flag
   */
  timer.update(userProperties);

  /*****************************
   * When leftovers are complete, query next folder from properties.remaining
   */

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
      } catch (err) {
        Util.log(ss, [err.message, err.fileName, err.lineNumber]);
      }

      // Send items to processFileList() to copy if there is anything to copy
      if (fileList.items && fileList.items.length > 0) {
        processFileList(
          fileList.items,
          timeZone,
          properties.copyPermissions,
          userProperties,
          timer,
          properties.map,
          ss,
          properties
        );
      } else {
        Logger.log('No children found.');
      }

      // get next page token to continue iteration
      properties.pageToken = fileList.nextPageToken;

      timer.update(userProperties);
    } while (properties.pageToken && timer.canContinue());
  }

  /*****************************
   * Cleanup
   */

  // Case: user manually stopped script
  if (timer.stop) {
    Util.saveState(
      properties,
      fileList,
      "Stopped manually by user.  Please use 'Resume' button to restart copying",
      ss
    );
    TriggerService.deleteTrigger(userProperties.getProperties().triggerId);
    return;

    // Case: maximum execution time has been reached
  } else if (timer.timeIsUp) {
    Util.saveState(
      properties,
      fileList,
      'Paused due to Google quota limits - copy will resume in 1-2 minutes',
      ss
    );

    // Case: the copy is complete!
  } else {
    // Delete trigger created at beginning of script,
    // move propertiesDoc to trash,
    // and update logger spreadsheet

    TriggerService.deleteTrigger(userProperties.getProperties().triggerId);
    try {
      Drive.Files.update(
        { labels: { trashed: true } },
        properties.propertiesDocId
      );
    } catch (err) {
      Util.log(ss, [err.message, err.fileName, err.lineNumber]);
    }
    ss
      .getRange(2, 3, 1, 1)
      .setValue('Complete')
      .setBackground('#66b22c');
    ss
      .getRange(2, 4, 1, 1)
      .setValue(
        Utilities.formatDate(new Date(), timeZone, 'MM-dd-yy hh:mm:ss a')
      );
  }
}


/**
 * Loops through array of files.items,
 * Applies Drive function to each (i.e. copy),
 * Logs result,
 * Copies permissions if selected and if file is a Drive document,
 * Get current runtime and decide if processing needs to stop.
 *
 * @param {Array} items the list of files over which to iterate
 */
function processFileList(
  items,
  timeZone,
  copyPermissions,
  userProperties,
  timer,
  map,
  ss,
  properties
) {
  var item, newfile;

  while (items.length > 0 && timer.canContinue()) {
    /*****************************
     * Get next file from passed file list.
     */
    item = items.pop();

    /*****************************
     * Copy each (files and folders are both represented the same in Google Drive)
     */
    newfile = FileService.copyFile(item, map, properties);

    /*****************************
     * Log result
     */
    if (newfile.id) {
      Util.log(ss, [
        'Copied',
        newfile.title,
        '=HYPERLINK("https://drive.google.com/open?id=' +
          newfile.id +
          '","' +
          newfile.title +
          '")',
        newfile.id,
        Utilities.formatDate(new Date(), timeZone, 'MM-dd-yy hh:mm:ss aaa')
      ]);
    } else {
      // newfile is error
      Util.log(ss, [
        'Error, ' + newfile,
        item.title,
        '=HYPERLINK("https://drive.google.com/open?id=' +
          item.id +
          '","' +
          item.title +
          '")',
        item.id,
        Utilities.formatDate(new Date(), timeZone, 'MM-dd-yy hh:mm:ss aaa')
      ]);
    }

    /*****************************
     * Copy permissions if selected, and if permissions exist to copy
     */
    if (copyPermissions) {
      if (
        item.mimeType == 'application/vnd.google-apps.document' ||
        item.mimeType == 'application/vnd.google-apps.folder' ||
        item.mimeType == 'application/vnd.google-apps.spreadsheet' ||
        item.mimeType == 'application/vnd.google-apps.presentation' ||
        item.mimeType == 'application/vnd.google-apps.drawing' ||
        item.mimeType == 'application/vnd.google-apps.form' ||
        item.mimeType == 'application/vnd.google-apps.script'
      ) {
        FileService.copyPermissions(item.id, item.owners, newfile.id);
      }
    }

    /*****************************
     * Update current runtime and user stop flag
     */
    timer.update(userProperties);
  }
}
