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
import Logging from './Logging';

export default class Util {
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
        Logging.log({ status: Util.composeErrorMsg(e) });
        if (n == 5) {
          Logging.log({
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
      Logging.log({
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
        Logging.log({ ss, status: ErrorMessages.OutOfSpace });
        Logging.log({ ss, status: ErrorMessages.WillDuplicateOnResume });
        // return early to prevent logging `logMessage`
        return;
      }
      Logging.log({
        ss,
        status: Util.composeErrorMsg(e, ErrorMessages.FailedSaveProperties)
      });
    }

    Logging.log({
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
        Logging.log({
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
