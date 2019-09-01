import FileService from './FileService';
import Util from './Util';
import ErrorMessages from './ErrorMessages';

// would be nice to call this "Logger" but that already exists in the Google Apps Script namespace
export default class Logging {
  /**
   * Logs values to the logger spreadsheet
   */
  static _log(
    ss: GoogleAppsScript.Spreadsheet.Sheet = Logging.getDefaultSheet(),
    values: string[]
  ): void {
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
        [ErrorMessages.SpreadsheetTooLarge]
      ]);
    }
  }

  static getDefaultSheet(): GoogleAppsScript.Spreadsheet.Sheet {
    return SpreadsheetApp.openById(
      PropertiesService.getUserProperties().getProperty('spreadsheetId')
    ).getSheetByName('Log');
  }

  static log({
    ss = Logging.getDefaultSheet(),
    status = '',
    title = '',
    id = '',
    timeZone = 'GMT-7',
    parentId = '',
    fileSize = 0
  }: {
    ss?: GoogleAppsScript.Spreadsheet.Sheet;
    status?: string;
    title?: string;
    id?: string;
    timeZone?: string;
    parentId?: string;
    fileSize?: number;
  }) {
    // map column names to indices
    const columns = {
      status: 0,
      title: 1,
      link: 2,
      id: 3,
      timeCompleted: 4,
      parentFolderLink: 5,
      fileSize: 6
    };

    // set values to array of empty strings, then assign value based on column index
    const values = Object.keys(columns).map(_ => '');
    values[columns.status] = status;
    values[columns.title] = title;
    values[columns.link] = FileService.getFileLinkForSheet(id, title);
    values[columns.id] = id;
    values[columns.timeCompleted] = Utilities.formatDate(
      new Date(),
      timeZone,
      'MM-dd-yy hh:mm:ss aaa'
    );
    values[columns.parentFolderLink] =
      parentId === ''
        ? parentId
        : FileService.getFileLinkForSheet(parentId, '');
    values[columns.fileSize] = Logging.bytesToHumanReadable(fileSize);

    // log values
    Logging._log(ss, values);
  }

  static logCopyError(
    ss: GoogleAppsScript.Spreadsheet.Sheet,
    error: Error,
    item: gapi.client.drive.FileResource,
    timeZone: string
  ): void {
    var parentId = item.parents && item.parents[0] ? item.parents[0].id : null;
    Logging.log({
      ss,
      status: Util.composeErrorMsg(error),
      title: item.title,
      id: item.id,
      timeZone,
      parentId
    });
  }

  static logCopySuccess(
    ss: GoogleAppsScript.Spreadsheet.Sheet,
    item: gapi.client.drive.FileResource,
    timeZone: string
  ): void {
    var parentId = item.parents && item.parents[0] ? item.parents[0].id : null;
    Logging.log({
      ss,
      status: 'Copied',
      title: item.title,
      id: item.id,
      timeZone,
      parentId,
      fileSize: item.fileSize
    });
  }

  // credit: https://stackoverflow.com/a/18650828
  static bytesToHumanReadable(bytes: number = 0, decimals: number = 2) {
    if (bytes === 0 || bytes === null || bytes === undefined) return '';
    const unit = 1024;
    const abbreviations = [
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
    const size = Math.floor(Math.log(bytes) / Math.log(unit));
    return (
      parseFloat((bytes / Math.pow(unit, size)).toFixed(decimals)) +
      ' ' +
      abbreviations[size]
    );
  }
}
