/**********************************************
 * Contains runtime properties for script
 **********************************************/

import Timer from './Timer';
import GDriveService from './GDriveService';
import ErrorMessages from './ErrorMessages';

export default class Properties {
  gDriveService: GDriveService;
  srcFolderID: string;
  srcFolderName: string;
  srcParentID: string;
  destFolderName: string;
  copyPermissions: boolean;
  copyTo: string;
  destParentID: string;
  destId: string;
  currFolderId?: string;
  spreadsheetId: string;
  propertiesDocId: string;
  leftovers?: gapi.client.drive.FileListResource;
  retryQueue: gapi.client.drive.FileResource[];
  map: object;
  remaining: string[];
  timeZone: string;
  totalRuntime: number;
  pageToken?: string;
  isOverMaxRuntime?: boolean;
  completed: object;

  constructor(gDriveService: GDriveService) {
    this.gDriveService = gDriveService;
    this.srcFolderID = '';
    this.srcFolderName = '';
    this.srcParentID = '';
    this.destFolderName = '';
    this.copyPermissions = false;
    this.copyTo = '';
    this.destParentID = '';
    this.destId = '';
    this.spreadsheetId = '';
    this.propertiesDocId = '';
    this.leftovers = null;
    this.retryQueue = [];
    this.map = {};
    this.remaining = [];
    this.timeZone = 'GMT-7';
    this.totalRuntime = 0;
    this.completed = {};

    return this;
  }
  /**
   * Load properties document from user's drive and parse.
   */
  load(): Properties {
    var _this = this;
    try {
      var propertiesDocId = PropertiesService.getUserProperties().getProperties()
        .propertiesDocId;
      var propertiesDoc = this.gDriveService.downloadFile(propertiesDocId);
    } catch (e) {
      if (e.message.indexOf('Unsupported Output Format') !== -1) {
        throw new Error(ErrorMessages.NoPropertiesDocumentId);
      }
      throw e;
    }

    try {
      var properties = JSON.parse(propertiesDoc);
    } catch (e) {
      throw new Error(ErrorMessages.ParseError);
    }

    Object.keys(properties).forEach(function(prop) {
      try {
        _this[prop] = properties[prop];
      } catch (e) {
        throw new Error(ErrorMessages.LoadingProp(prop, properties[prop]));
      }
    });

    return this;
  }

  incrementTotalRuntime(duration: number): void {
    this.totalRuntime += duration;
  }

  /**
   * Determine if script has exceeded max daily runtime
   * If yes, need to sleep for one day to avoid throwing
   * "Script using too much computer time" error
   */
  checkMaxRuntime(): boolean {
    this.isOverMaxRuntime =
      this.totalRuntime + Timer.MAX_RUNTIME >= Timer.MAX_RUNTIME_PER_DAY;
    return this.isOverMaxRuntime;
  }

  /**
   * Stringify properties argument and save to file in user's Drive
   */
  static save(
    properties: Properties | FrontEndOptions,
    gDriveService: GDriveService
  ): gapi.client.drive.FileResource {
    try {
      var stringifiedProps = JSON.stringify(properties);
    } catch (e) {
      throw new Error(ErrorMessages.SerializeError);
    }
    return gDriveService.updateFile(
      {
        upload: 'multipart',
        alt: 'json'
      },
      properties.propertiesDocId,
      Utilities.newBlob(stringifiedProps)
    );
  }

  /**
   * save srcId, destId, copyPermissions, spreadsheetId to userProperties.
   *
   * This is used when resuming, in which case the IDs of the logger spreadsheet and
   * properties document will not be known.
   */
  static setUserPropertiesStore(
    spreadsheetId: string,
    propertiesDocId: string,
    destId: string,
    resuming: string
  ): void {
    var userProperties = PropertiesService.getUserProperties();
    userProperties.setProperty('destId', destId);
    userProperties.setProperty('spreadsheetId', spreadsheetId);
    userProperties.setProperty('propertiesDocId', propertiesDocId);
    userProperties.setProperty('trials', 0);
    userProperties.setProperty('resuming', resuming);
    userProperties.setProperty('stop', 'false');
  }
}
