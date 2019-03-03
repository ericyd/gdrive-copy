import Timer from './Timer';
import MimeType from './MimeType';
import API from './API';
import Constants from './Constants';
import ErrorMessages from './ErrorMessages';

/**********************************************
 * Namespace to wrap calls to Drive API
 **********************************************/
export default class GDriveService {
  lastRequest: number;
  minElapsed: number;
  trottle: (any) => any;
  maxResults: number;

  constructor() {
    this.lastRequest = Timer.now();
    this.minElapsed = 100; // 1/10th of a second, in ms
    this.trottle = this.throttle.bind(this);
    this.maxResults = 200;
    return this;
  }

  /**
   * Run passed function no more than 10 per second (1 per 1/10th of a second)
   * Uses global `Utilities` object from Google Apps Script
   *
   * This is not my favorite way to implement, but using an async queue is problematic
   * when the script has to stop, save state, and restart. Better implementations may be considered
   * in the future.
   * @param {closure} func
   */
  throttle(func: () => any): any {
    var elapsed = Timer.now() - this.lastRequest;
    if (elapsed < this.minElapsed) {
      Utilities.sleep(this.minElapsed - elapsed);
    }
    this.lastRequest = Timer.now();
    return func();
  }

  /**
   * Returns metadata for input file ID
   */
  getPermissions(
    id: string
  ): { items: gapi.client.drive.PermissionResource[] } {
    return this.throttle(function() {
      return Drive.Permissions.list(id);
    });
  }

  /**
   * Gets files from query and returns fileList with metadata
   * @param {string} query the query to select files from the Drive
   * @param {string} pageToken the pageToken (if any) for the existing query
   * @return {File List} fileList object where fileList.items is an array of children files
   */
  getFiles(
    query: string,
    pageToken: string | null,
    orderBy?: string
  ): gapi.client.drive.FileListResource {
    return this.throttle(function() {
      return Drive.Files.list({
        q: query,
        maxResults: this.maxResults,
        pageToken: pageToken,
        orderBy: orderBy
      });
    });
  }

  downloadFile(id: string): string {
    return this.throttle(function() {
      return DriveApp.getFileById(id)
        .getBlob()
        .getDataAsString();
    });
  }

  /**
   * Updates a file's content and metadata
   */
  updateFile(
    metadata: object,
    fileID: string,
    mediaData?: object
  ): gapi.client.drive.FileResource {
    return this.throttle(function() {
      return Drive.Files.update(metadata, fileID, mediaData);
    });
  }

  /**
   * Insert a file with metadata defined by `body`
   */
  insertFolder(body: object): gapi.client.drive.FileResource {
    return this.throttle(function() {
      return Drive.Files.insert(body);
    });
  }

  /**
   * Insert file with fixed metadata used to store properties
   */
  insertBlankFile(parentID: string): gapi.client.drive.FileResource {
    // doesn't need to be throttled because it returns a throttled function
    return this.insertFolder(
      API.copyFileBody(
        parentID,
        Constants.PropertiesDocTitle,
        MimeType.PLAINTEXT,
        Constants.PropertiesDocDescription
      )
    );
  }

  copyFile(
    body: gapi.client.drive.FileResource,
    id: string
  ): gapi.client.drive.FileResource {
    return this.throttle(function() {
      return Drive.Files.copy(body, id);
    });
  }

  /**
   * Inserts a permission on a file
   * @param {object} body metadata for permission
   */
  insertPermission(
    body: object,
    id: string,
    options: object
  ): gapi.client.drive.PermissionResource {
    return this.throttle(function() {
      return Drive.Permissions.insert(body, id, options);
    });
  }

  /**
   * Removes one permission from file
   */
  removePermission(fileID: string, permissionID: string): void {
    return this.throttle(function() {
      return Drive.Permissions.remove(fileID, permissionID);
    });
  }

  getRootID(): string {
    return this.throttle(function() {
      return DriveApp.getRootFolder().getId();
    });
  }

  openSpreadsheet(spreadsheetId: string): GoogleAppsScript.Spreadsheet.Sheet {
    var ss: GoogleAppsScript.Spreadsheet.Sheet;
    try {
      ss = SpreadsheetApp.openById(spreadsheetId).getSheetByName('Log');
    } catch (e) {
      try {
        ss = SpreadsheetApp.openById(
          PropertiesService.getUserProperties().getProperty('spreadsheetId')
        ).getSheetByName('Log');
      } catch (e) {
        // if the spreadsheet cannot be accessed, this should be considered a fatal error
        // and the script should not continue
        throw new Error(ErrorMessages.SpreadsheetNotFound);
      }
    }
    return ss;
  }
}
