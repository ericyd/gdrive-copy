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

//removeIf(production)
// Google Apps Script doesn't play well with module.exports,
// but it is required for testing
module.exports = Util;
//endRemoveIf(production)
