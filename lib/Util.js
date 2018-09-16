/**********************************************
 * Namespace to wrap utility functions
 **********************************************/
//removeIf(production)
// Google Apps Script doesn't play well with module.exports,
// but it is required for testing
var TriggerService = require('./TriggerService');
//endRemoveIf(production)

var Util = {
  msgs: {
    maxRuntimeExceeded:
      'Script has reached daily maximum run time of 90 minutes. ' +
      'Script must pause for 24 hours to reset Google Quotas, and will resume at that time. ' +
      'For more information, please see https://developers.google.com/apps-script/guides/services/quotas',
    userStoppedScript:
      'Stopped manually by user. Please use "Resume" button to restart copying',
    singleRunExceeded:
      'Paused due to Google quota limits - copy will resume in 1-2 minutes'
  }
};

/**
 * Logs values to the logger spreadsheet
 * @param {object} ss instance of Sheet class representing the logger spreadsheet
 * @param {Array} values array of values to be written to the spreadsheet
 */
Util.log = function(ss, values) {
  if (ss === null || ss === undefined) {
    ss = SpreadsheetApp.openById(
      PropertiesService.getUserProperties().getProperty('spreadsheetId')
    ).getSheetByName('Log');
  }

  // avoid placing entries that are too long
  values = values.map(function(cell) {
    return cell.slice(0, 4999);
  });

  // gets last row with content.
  // getMaxRows() gets returns the current number of rows in the sheet, regardless of content.
  var lastRow = ss.getLastRow();
  var startRow = lastRow + 1;
  var startColumn = 1; // columns are 1-indexed
  var numRows = 1;
  var numColumns = values.length;

  try {
    ss
      // 2018-02-23: fix `Service Error: Spreadsheets`
      // Ensure that we don't try to insert to a row that doesn't exist
      // resource: https://stackoverflow.com/questions/23165101/service-error-spreadsheets-on-google-scripts
      .insertRowAfter(lastRow)
      .getRange(startRow, startColumn, numRows, numColumns)
      // setValues needs a 2-dimensional array in case you are inserting multiple rows.
      // we always log one row at a time, though this could be changed in the future.
      .setValues([values]);
  } catch (e) {
    // Google sheets doesn't allow inserting more than 2,000,000 rows into a spreadsheet
    ss.getRange(lastRow, startColumn, numRows, 1).setValues([
      [
        'The spreadsheet is too large to continue logging, but the service will continue to run in the background'
      ]
    ]);
  }
};

/**
 * Invokes a function, performing up to 5 retries with exponential backoff.
 * Retries with delays of approximately 1, 2, 4, 8 then 16 seconds for a total of
 * about 32 seconds before it gives up and rethrows the last error.
 * See: https://developers.google.com/google-apps/documents-list/#implementing_exponential_backoff
 * Author: peter.herrmann@gmail.com (Peter Herrmann)
 * @param {Function} func The anonymous or named function to call.
 * @param {string} errorMsg Message to output in case of error
 * @return {*} The value returned by the called function.
 */
Util.exponentialBackoff = function(func, errorMsg) {
  for (var n = 0; n < 6; n++) {
    try {
      return func();
    } catch (e) {
      Util.log(null, Util.composeErrorMsg(e));
      if (n == 5) {
        Util.log(null, [
          errorMsg,
          '',
          '',
          '',
          Utilities.formatDate(new Date(), 'GMT-7', 'MM-dd-yy hh:mm:ss aaa')
        ]);
        throw e;
      }
      Utilities.sleep(Math.pow(2, n) * 1000 + Math.round(Math.random() * 1000));
    }
  }
};

/**
 * Save properties and update log
 * @param {Properties} properties
 * @param {File List} fileList
 * @param {string} logMessage - The message to output to the log when state is saved
 * @param {Sheet} ss spreadsheet instance
 */
Util.saveState = function(properties, fileList, logMessage, ss, gDriveService) {
  // save, create trigger, and assign pageToken for continuation
  try {
    properties.leftovers =
      fileList && fileList.items ? fileList : properties.leftovers;
    properties.pageToken = properties.leftovers.nextPageToken;
  } catch (e) {
    Util.log(
      ss,
      Util.composeErrorMsg(
        e,
        'Failed to set leftover file list. Error Message: '
      )
    );
  }

  try {
    Properties.save(properties, gDriveService);
  } catch (e) {
    if (e.message.indexOf('exceeded their Drive storage quota') !== -1) {
      // inform user that script will not restart
      // they must clear space and manually resume
      // if they resume, they will get duplicated files
      try {
        TriggerService.deleteTrigger(
          PropertiesService.getUserProperties().getProperty('triggerId')
        );
      } catch (e) {
        // likely already deleted, shouldn't be a big deal
      }
      Util.log(ss, [
        'You have run out of space in your Drive! ' +
          'You should delete some files and then come back ' +
          'and use the "Resume" feature to restart your copy.'
      ]);
      Util.log(ss, [
        'HEADS UP! Your most recently copied files WILL BE DUPLICATED if you resume. ' +
          'To avoid duplicating, you will need to restart your copy from the beginning'
      ]);
      // return early to prevent logging `logMessage`
      return;
    }
    Util.log(
      ss,
      Util.composeErrorMsg(
        e,
        'Failed to save properties. ' +
          'This could affect script performance and may require restarting the copy. ' +
          'Error Message: '
      )
    );
  }

  Util.log(ss, [logMessage]);
};

Util.cleanup = function(
  properties,
  fileList,
  userProperties,
  timer,
  ss,
  gDriveService
) {
  // track totalRuntime to avoid exceeding quota
  properties.incrementTotalRuntime(timer.runtime);

  // Set the stop message that will be displayed to user on script pause
  var stopMsg = Util.msgs.singleRunExceeded;
  if (timer.stop) {
    // user manually stopped script
    stopMsg = Util.msgs.userStoppedScript;
    TriggerService.deleteTrigger(userProperties.getProperty('triggerId'));
  } else if (properties.isOverMaxRuntime) {
    // daily runtime exceeded.
    stopMsg = Util.msgs.maxRuntimeExceeded;
    // Reset totalRuntime - next trigger will be 24 hours in future
    properties.totalRuntime = 0;
  }

  // Either stop flag or runtime exceeded. Must save state
  if (!timer.canContinue()) {
    Util.saveState(properties, fileList, stopMsg, ss, gDriveService);
  } else {
    // The copy is complete!

    // Delete trigger created at beginning of script,
    // move propertiesDoc to trash,
    // and update logger spreadsheet
    TriggerService.deleteTrigger(userProperties.getProperty('triggerId'));
    try {
      gDriveService.updateFile(
        { labels: { trashed: true } },
        properties.propertiesDocId
      );
    } catch (e) {
      Util.log(ss, Util.composeErrorMsg(e));
    }
    ss.getRange(2, 3, 1, 1)
      .setValue('Complete')
      .setBackground('#66b22c');
    ss.getRange(2, 4, 1, 1).setValue(
      Utilities.formatDate(
        new Date(),
        properties.timeZone,
        'MM-dd-yy hh:mm:ss a'
      )
    );
  }
};

/**
 * Returns a reasonable error message wrapped in an array which is required by Util.log
 * @param {Error} e
 * @param {string} customMsg
 * @returns {Array}
 */
Util.composeErrorMsg = function(e, customMsg) {
  customMsg = customMsg || 'Error: ';
  return [
    customMsg + e.message + '. File: ' + e.fileName + '. Line: ' + e.lineNumber
  ];
};

//removeIf(production)
// Google Apps Script doesn't play well with module.exports,
// but it is required for testing
module.exports = Util;
//endRemoveIf(production)
