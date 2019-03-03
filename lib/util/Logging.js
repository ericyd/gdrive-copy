'use strict';
exports.__esModule = true;
var FileService_1 = require('../FileService');
var Util_1 = require('../Util');
var ErrorMessages_1 = require('../ErrorMessages');
// would be nice to call this Logger but that already exists in the Google Apps Script namespace
var Logging = /** @class */ (function() {
  function Logging() {}
  /**
   * Logs values to the logger spreadsheet
   */
  Logging._log = function(ss, values) {
    if (ss === void 0) {
      ss = Logging.getDefaultSheet();
    }
    // avoid placing entries that are too long
    values = values.map(function(cell) {
      if (cell && typeof cell == 'string') {
        return cell.slice(0, 4999);
      }
      return '';
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
        [ErrorMessages_1['default'].SpreadsheetTooLarge]
      ]);
    }
  };
  Logging.getDefaultSheet = function() {
    return SpreadsheetApp.openById(
      PropertiesService.getUserProperties().getProperty('spreadsheetId')
    ).getSheetByName('Log');
  };
  Logging.log = function(_a) {
    var _b = _a.ss,
      ss = _b === void 0 ? Logging.getDefaultSheet() : _b,
      _c = _a.status,
      status = _c === void 0 ? '' : _c,
      _d = _a.title,
      title = _d === void 0 ? '' : _d,
      _e = _a.id,
      id = _e === void 0 ? '' : _e,
      _f = _a.timeZone,
      timeZone = _f === void 0 ? 'GMT-7' : _f,
      _g = _a.parentId,
      parentId = _g === void 0 ? '' : _g,
      _h = _a.fileSize,
      fileSize = _h === void 0 ? 0 : _h;
    // map column names to indices
    var columns = {
      status: 0,
      title: 1,
      link: 2,
      id: 3,
      timeCompleted: 4,
      parentFolderLink: 5,
      fileSize: 6
    };
    // set values to array of empty strings, then assign value based on column index
    var values = Object.keys(columns).map(function(_) {
      return '';
    });
    values[columns.status] = status;
    values[columns.title] = title;
    values[columns.link] = FileService_1['default'].getFileLinkForSheet(
      id,
      title
    );
    values[columns.id] = id;
    values[columns.timeCompleted] = Utilities.formatDate(
      new Date(),
      timeZone,
      'MM-dd-yy hh:mm:ss aaa'
    );
    values[columns.parentFolderLink] =
      parentId === ''
        ? parentId
        : FileService_1['default'].getFileLinkForSheet(parentId, '');
    values[columns.fileSize] = Logging.bytesToHumanReadable(fileSize);
    // log values
    Logging._log(ss, values);
  };
  Logging.logCopyError = function(ss, error, item, timeZone) {
    var parentId = item.parents && item.parents[0] ? item.parents[0].id : null;
    Logging.log({
      ss: ss,
      status: Util_1.Util.composeErrorMsg(error),
      title: item.title,
      id: item.id,
      timeZone: timeZone,
      parentId: parentId
    });
  };
  Logging.logCopySuccess = function(ss, item, timeZone) {
    var parentId = item.parents && item.parents[0] ? item.parents[0].id : null;
    Logging.log({
      ss: ss,
      status: 'Copied',
      title: item.title,
      id: item.id,
      timeZone: timeZone,
      parentId: parentId,
      fileSize: item.fileSize
    });
  };
  // credit: https://stackoverflow.com/a/18650828
  Logging.bytesToHumanReadable = function(bytes, decimals) {
    if (bytes === void 0) {
      bytes = 0;
    }
    if (decimals === void 0) {
      decimals = 2;
    }
    if (bytes === 0 || bytes === null || bytes === undefined) return '';
    var unit = 1024;
    var abbreviations = [
      'bytes',
      'KB',
      'MB',
      'GB',
      'TB',
      'PB',
      'EB',
      'ZB',
      'YB'
    ];
    var size = Math.floor(Math.log(bytes) / Math.log(unit));
    return (
      parseFloat((bytes / Math.pow(unit, size)).toFixed(decimals)) +
      ' ' +
      abbreviations[size]
    );
  };
  return Logging;
})();
exports['default'] = Logging;
