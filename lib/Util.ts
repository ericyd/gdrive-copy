/**********************************************
 * Namespace to wrap utility functions
 **********************************************/

import TriggerService from './TriggerService';
import Properties from './Properties';
import FileService from './FileService';
import GDriveService from './GDriveService';
import Timer from './Timer';
import Constants from './Constants';
import ErrorMessages from './ErrorMessages';

export default class Util {
  /**
   * Logs values to the logger spreadsheet
   */
  static _log(
    ss: GoogleAppsScript.Spreadsheet.Sheet = Util.getDefaultSheet(),
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
    ss = Util.getDefaultSheet(),
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
      name: 1,
      link: 2,
      id: 3,
      timeCompleted: 4,
      parentFolderLink: 5
    };

    // set values to array of empty strings, then assign value based on column index
    const values = Object.keys(columns).map(_ => '');
    values[columns.status] = status;
    values[columns.name] = name;
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

    // log values
    Util._log(ss, values);
  }

  static logCopyError(
    ss: GoogleAppsScript.Spreadsheet.Sheet,
    error: Error,
    item: gapi.client.drive.FileResource,
    timeZone: string
  ): void {
    var parentId = item.parents && item.parents[0] ? item.parents[0].id : null;
    Util.log({
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
    Util.log({
      ss,
      status: 'Copied',
      title: item.title,
      id: item.id,
      timeZone,
      parentId
    });
  }

  /**
   * Invokes a function, performing up to 5 retries with exponential backoff.
   * Retries with delays of approximately 1, 2, 4, 8 then 16 seconds for a total of
   * about 32 seconds before it gives up and rethrows the last error.
   * See: https://developers.google.com/google-apps/documents-list/#implementing_exponential_backoff
   * Author: peter.herrmann@gmail.com (Peter Herrmann)
   */
  static exponentialBackoff(func: (a?: any) => any, errorMsg: string): any {
    for (var n = 0; n < 6; n++) {
      try {
        return func();
      } catch (e) {
        Util.log({ status: Util.composeErrorMsg(e) });
        if (n == 5) {
          Util.log({
            status: errorMsg
          });
          throw e;
        }
        Utilities.sleep(
          Math.pow(2, n) * 1000 + Math.round(Math.random() * 1000)
        );
      }
    }
  }

  /**
   * Save properties and update log
   */
  static saveState(
    properties: Properties,
    fileList: gapi.client.drive.FileListResource,
    logMessage: string,
    ss: GoogleAppsScript.Spreadsheet.Sheet,
    gDriveService: GDriveService
  ) {
    // save, create trigger, and assign pageToken for continuation
    try {
      properties.leftovers =
        fileList && fileList.items ? fileList : properties.leftovers;
      properties.pageToken = properties.leftovers.nextPageToken;
    } catch (e) {
      Util.log({
        ss,
        status: Util.composeErrorMsg(e, ErrorMessages.FailedSetLeftovers)
      });
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
        Util.log({ ss, status: ErrorMessages.OutOfSpace });
        Util.log({ ss, status: ErrorMessages.WillDuplicateOnResume });
        // return early to prevent logging `logMessage`
        return;
      }
      Util.log({
        ss,
        status: Util.composeErrorMsg(e, ErrorMessages.FailedSaveProperties)
      });
    }

    Util.log({
      ss,
      status: logMessage
    });
  }

  static cleanup(
    properties: Properties,
    fileList: gapi.client.drive.FileListResource,
    userProperties: GoogleAppsScript.Properties.UserProperties,
    timer: Timer,
    ss: GoogleAppsScript.Spreadsheet.Sheet,
    gDriveService: GDriveService
  ): void {
    // track totalRuntime to avoid exceeding quota
    properties.incrementTotalRuntime(timer.runtime);

    // Set the stop message that will be displayed to user on script pause
    var stopMsg = Constants.SingleRunExceeded;
    if (timer.stop) {
      // user manually stopped script
      stopMsg = Constants.UserStoppedScript;
      TriggerService.deleteTrigger(userProperties.getProperty('triggerId'));
    } else if (properties.isOverMaxRuntime) {
      // daily runtime exceeded.
      stopMsg = Constants.MaxRuntimeExceeded;
      // Reset totalRuntime - next trigger will be 24 hours in future
      properties.totalRuntime = 0;
    }

    // Either stop flag or runtime exceeded. Must save state
    if (!timer.canContinue() || properties.retryQueue.length > 0) {
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
        Util.log({
          ss,
          status: Util.composeErrorMsg(e)
        });
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
  }

  static composeErrorMsg(e: Error, customMsg: string = 'Error: '): string {
    return `${customMsg} ${e.message}. File: ${e.fileName}. Line: ${
      e.lineNumber
    }`;
  }

  static isNone(obj: any): boolean {
    return obj === null || obj === undefined;
  }

  static isSome(obj: any): boolean {
    return !Util.isNone(obj);
  }

  static hasSome(obj: object, prop: string): boolean {
    return obj && obj[prop] && obj[prop].length > 0;
  }
}
