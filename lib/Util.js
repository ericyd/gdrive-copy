/**********************************************
 * Namespace to wrap utility functions
 **********************************************/
function Util() {
  return this;
}

/**
 * Logs values to the logger spreadsheet
 *
 * @param {object} ss instance of Sheet class representing the logger spreadsheet
 * @param {Array} values array of values to be written to the spreadsheet
 */
Util.log = function(ss, values) {
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
      Util.log(null, [e.message, e.fileName, e.lineNumber]);
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
Util.saveState = function(properties, fileList, logMessage, ss) {
  try {
    // save, create trigger, and assign pageToken for continuation
    properties.leftovers =
      fileList && fileList.items ? fileList : properties.leftovers;
    properties.pageToken = properties.leftovers.nextPageToken;
  } catch (err) {
    Util.log(ss, [err.message, err.fileName, err.lineNumber]);
  }

  try {
    Properties.saveProperties(properties);
  } catch (err) {
    Util.log(ss, [err.message, err.fileName, err.lineNumber]);
  }

  Util.log(ss, [logMessage]);
};

//removeIf(production)
// Google Apps Script doesn't play well with module.exports,
// but it is required for testing
module.exports = Util;
//endRemoveIf(production)
