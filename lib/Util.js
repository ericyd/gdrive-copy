/**********************************************
 * Namespace to wrap utility functions
 **********************************************/
//removeIf(production)
// Google Apps Script doesn't play well with module.exports,
// but it is required for testing
var TriggerService = require('./TriggerService');
var GDriveService = require('./GDriveService');
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
 *
 * @param {object} ss instance of Sheet class representing the logger spreadsheet
 * @param {Array} values array of values to be written to the spreadsheet
 */
Util.log = function(ss, values) {
  if (ss === null || ss === undefined) {
    ss = SpreadsheetApp.openById(
      PropertiesService.getUserProperties().getProperty('spreadsheetId')
    ).getSheetByName('Log');
  }

  return ss
    .getRange(ss.getLastRow() + 1, 1, 1, values.length)
    .setValues([values]);
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
 * Delete existing triggers, save properties, and create new trigger
 *
 * @param {string} logMessage - The message to output to the log when state is saved
 */
Util.saveState = function(properties, fileList, logMessage, ss, timer) {
  // update total runtime
  try {
    PropertiesService.getUserProperties().setProperty(
      'totalRuntime',
      timer.currentTime
    );
  } catch (e) {
    Util.log(
      ss,
      Util.composeErrorMsg(
        e,
        'Failed to update total runtime. This could affect script performance. Error Message: '
      )
    );
  }
  try {
    // save, create trigger, and assign pageToken for continuation
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
    Properties.save(properties);
  } catch (e) {
    Util.log(
      ss,
      Util.composeErrorMsg(
        e,
        'Failed to save properties. This could affect script performance and may require restarting the copy. Error Message: '
      )
    );
  }

  Util.log(ss, [logMessage]);
};

Util.cleanup = function(properties, fileList, userProperties, timer, ss) {
  var stopMsg = Util.msgs.singleRunExceeded;
  if (timer.stop) {
    // user manually stopped script
    stopMsg = Util.msgs.userStoppedScript;
    TriggerService.deleteTrigger(userProperties.getProperty('triggerId'));
  } else if (properties.maxRuntimeExceeded) {
    // daily runtime exceeded
    stopMsg = Util.msgs.maxRuntimeExceeded;
  }

  // Either stop flag or runtime exceeded. Must save state
  if (!timer.canContinue()) {
    Util.saveState(properties, fileList, stopMsg, ss, timer);
  } else {
    // The copy is complete!

    // Delete trigger created at beginning of script,
    // move propertiesDoc to trash,
    // and update logger spreadsheet
    TriggerService.deleteTrigger(userProperties.getProperty('triggerId'));
    try {
      GDriveService.updateFile(
        { labels: { trashed: true } },
        properties.propertiesDocId
      );
    } catch (e) {
      Util.log(ss, Util.composeErrorMsg(e));
    }
    ss
      .getRange(2, 3, 1, 1)
      .setValue('Complete')
      .setBackground('#66b22c');
    ss
      .getRange(2, 4, 1, 1)
      .setValue(
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
