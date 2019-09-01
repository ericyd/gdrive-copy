/**********************************************
 * Namespace for file-related functions
 **********************************************/

import Util from './Util';
import { getMetadata } from './public';
import Properties from './Properties';
import Timer from './Timer';
import GDriveService from './GDriveService';
import API from './API';
import MimeType from './MimeType';
import Constants from './Constants';
import ErrorMessages from './ErrorMessages';
import FeatureFlag from './FeatureFlag';
import Logging from './Logging';

export default class FileService {
  gDriveService: GDriveService;
  timer: Timer;
  properties: Properties;
  nativeMimeTypes: string[];
  maxNumberOfAttempts: number;

  constructor(
    gDriveService: GDriveService,
    timer: Timer,
    properties: Properties
  ) {
    this.gDriveService = gDriveService;
    this.timer = timer;
    this.properties = properties;
    this.nativeMimeTypes = [
      MimeType.DOC,
      MimeType.DRAWING,
      MimeType.FOLDER,
      MimeType.FORM,
      MimeType.SCRIPT,
      MimeType.SHEET,
      MimeType.SLIDES
    ];
    this.maxNumberOfAttempts = 3; // this is arbitrary, could go up or down
    return this;
  }

  /**
   * Try to copy file to destination parent, or add new folder if it's a folder
   */
  copyFile(
    file: gapi.client.drive.FileResource
  ): gapi.client.drive.FileResource {
    // if folder, use insert, else use copy
    if (file.mimeType == MimeType.FOLDER) {
      var r = this.gDriveService.insertFolder(
        API.copyFileBody(
          this.properties.map[file.parents[0].id],
          file.title,
          MimeType.FOLDER,
          file.description
        )
      );

      // Update list of remaining folders
      this.properties.remaining.push(file.id);

      // map source to destination
      this.properties.map[file.id] = r.id;

      return r;
    } else {
      return this.gDriveService.copyFile(
        API.copyFileBody(this.properties.map[file.parents[0].id], file.title),
        file.id
      );
    }
  }

  /**
   * copy permissions from source to destination file/folder
   */
  copyPermissions(
    srcId: string,
    owners: { emailAddress: string }[],
    destId: string
  ): void {
    var permissions, destPermissions, i, j;

    try {
      permissions = this.gDriveService.getPermissions(srcId).items;
    } catch (e) {
      Logging.log({ status: Util.composeErrorMsg(e) });
    }

    // copy editors, viewers, and commenters from src file to dest file
    if (permissions && permissions.length > 0) {
      for (i = 0; i < permissions.length; i++) {
        // if there is no email address, it is only sharable by link.
        // These permissions will not include an email address, but they will include an ID
        // Permissions.insert requests must include either value or id,
        // thus the need to differentiate between permission types
        try {
          if (permissions[i].emailAddress) {
            if (permissions[i].role == 'owner') continue;

            this.gDriveService.insertPermission(
              API.permissionBodyValue(
                permissions[i].role,
                permissions[i].type,
                permissions[i].emailAddress
              ),
              destId,
              {
                sendNotificationEmails: 'false'
              }
            );
          } else {
            this.gDriveService.insertPermission(
              API.permissionBodyId(
                permissions[i].role,
                permissions[i].type,
                permissions[i].id,
                permissions[i].withLink
              ),
              destId,
              {
                sendNotificationEmails: 'false'
              }
            );
          }
        } catch (e) {}
      }
    }

    // convert old owners to editors
    if (owners && owners.length > 0) {
      for (i = 0; i < owners.length; i++) {
        try {
          this.gDriveService.insertPermission(
            API.permissionBodyValue('writer', 'user', owners[i].emailAddress),
            destId,
            {
              sendNotificationEmails: 'false'
            }
          );
        } catch (e) {}
      }
    }

    // remove permissions that exist in dest but not source
    // these were most likely inherited from parent

    try {
      destPermissions = this.gDriveService.getPermissions(destId).items;
    } catch (e) {
      Logging.log({ status: Util.composeErrorMsg(e) });
    }

    if (destPermissions && destPermissions.length > 0) {
      for (i = 0; i < destPermissions.length; i++) {
        for (j = 0; j < permissions.length; j++) {
          if (destPermissions[i].id == permissions[j].id) {
            break;
          }
          // if destPermissions does not exist in permissions, delete it
          if (
            j == permissions.length - 1 &&
            destPermissions[i].role != 'owner'
          ) {
            this.gDriveService.removePermission(destId, destPermissions[i].id);
          }
        }
      }
    }
  }

  /**
   * Process leftover files from prior query results
   * that weren't processed before script timed out.
   * Destination folder must be set to the parent of the first leftover item.
   * The list of leftover items is an equivalent array to fileList returned from the getFiles() query
   */
  handleLeftovers(
    userProperties: GoogleAppsScript.Properties.UserProperties,
    ss: GoogleAppsScript.Spreadsheet.Sheet
  ): void {
    if (Util.hasSome(this.properties.leftovers, 'items')) {
      this.properties.currFolderId = this.properties.leftovers.items[0].parents[0].id;
      this.processFileList(this.properties.leftovers.items, userProperties, ss);
    }
  }

  handleRetries(
    userProperties: GoogleAppsScript.Properties.UserProperties,
    ss: GoogleAppsScript.Spreadsheet.Sheet
  ): void {
    if (Util.hasSome(this.properties, 'retryQueue')) {
      this.properties.currFolderId = this.properties.retryQueue[0].parents[0].id;
      this.processFileList(this.properties.retryQueue, userProperties, ss);
    }
  }

  /**
   * Loops through array of files.items,
   * Applies Drive function to each (i.e. copy),
   * Logs result,
   * Copies permissions if selected and if file is a Drive document,
   * Get current runtime and decide if processing needs to stop.
   */
  processFileList(
    items: gapi.client.drive.FileResource[],
    userProperties: GoogleAppsScript.Properties.UserProperties,
    ss: GoogleAppsScript.Spreadsheet.Sheet
  ): void {
    while (items.length > 0 && this.timer.canContinue()) {
      // Get next file from passed file list.
      var item = items.pop();

      if (
        item.numberOfAttempts &&
        item.numberOfAttempts > this.maxNumberOfAttempts
      ) {
        Logging.logCopyError(ss, item.error, item, this.properties.timeZone);
        continue;
      }

      if (FeatureFlag.SKIP_DUPLICATE_ID) {
        // if item has already been completed, skip to avoid infinite loop bugs
        if (this.properties.completed[item.id]) {
          continue;
        }
      }

      // Copy each (files and folders are both represented the same in Google Drive)
      try {
        var newfile = this.copyFile(item);

        if (FeatureFlag.SKIP_DUPLICATE_ID) {
          // record that this file has been processed
          this.properties.completed[item.id] = true;
        }

        // log the new file as successful
        Logging.logCopySuccess(ss, newfile, this.properties.timeZone);
      } catch (e) {
        this.properties.retryQueue.unshift({
          id: item.id,
          title: item.title,
          description: item.description,
          parents: item.parents,
          mimeType: item.mimeType,
          error: e,
          owners: item.owners,
          numberOfAttempts: item.numberOfAttempts
            ? item.numberOfAttempts + 1
            : 1
        });
      }

      // Copy permissions if selected, and if permissions exist to copy
      try {
        if (
          this.properties.copyPermissions &&
          this.nativeMimeTypes.indexOf(item.mimeType) !== -1
        ) {
          this.copyPermissions(item.id, item.owners, newfile.id);
        }
      } catch (e) {
        // TODO: logging needed for failed permissions copying?
      }

      // Update current runtime and user stop flag
      this.timer.update(userProperties);
    }
  }

  /**
   * Create the root folder of the new copy.
   * Copy permissions from source folder to destination folder if copyPermissions == yes
   */
  initializeDestinationFolder(
    options: FrontEndOptions,
    today: string
  ): gapi.client.drive.FileResource {
    var destFolder;
    var destParentID;
    switch (options.copyTo) {
      case 'same':
        destParentID = options.srcParentID;
        break;
      case 'custom':
        destParentID = options.destParentID;
        break;
      default:
        destParentID = this.gDriveService.getRootID();
    }

    if (
      options.copyTo === 'custom' &&
      FileService.isDescendant([options.destParentID], options.srcFolderID)
    ) {
      throw new Error(ErrorMessages.Descendant);
    }

    destFolder = this.gDriveService.insertFolder(
      API.copyFileBody(
        destParentID,
        options.destFolderName,
        'application/vnd.google-apps.folder',
        `Copy of ${options.srcFolderName}, created ${today}`
      )
    );

    if (options.copyPermissions) {
      this.copyPermissions(options.srcFolderID, null, destFolder.id);
    }

    return destFolder;
  }

  /**
   * Create the spreadsheet used for logging progress of the copy
   * @return {File Resource} metadata for logger spreadsheet, or error on fail
   */
  createLoggerSpreadsheet(
    today: string,
    destId: string
  ): gapi.client.drive.FileResource {
    return this.gDriveService.copyFile(
      API.copyFileBody(destId, `Copy Folder Log ${today}`),
      Constants.BaseCopyLogId
    );
  }

  /**
   * Create document that is used to store temporary properties information when the app pauses.
   * Create document as plain text.
   * This will be deleted upon script completion.
   */
  createPropertiesDocument(destId: string): string {
    var propertiesDoc = this.gDriveService.insertBlankFile(destId);
    return propertiesDoc.id;
  }

  findPriorCopy(
    folderId: string
  ): { spreadsheetId: string; propertiesDocId: string } {
    // find DO NOT MODIFY OR DELETE file (e.g. propertiesDoc)
    var query = `'${folderId}' in parents and title contains 'DO NOT DELETE OR MODIFY' and mimeType = '${
      MimeType.PLAINTEXT
    }'`;
    var p = this.gDriveService.getFiles(
      query,
      null,
      'modifiedDate,createdDate'
    );

    // find copy log
    query = `'${folderId}' in parents and title contains 'Copy Folder Log' and mimeType = '${
      MimeType.SHEET
    }'`;
    var s = this.gDriveService.getFiles(query, null, 'title desc');

    try {
      return {
        spreadsheetId: s.items[0].id,
        propertiesDocId: p.items[0].id
      };
    } catch (e) {
      throw new Error(ErrorMessages.DataFilesNotFound);
    }
  }

  /**
   * Determines if maybeChildID is a descendant of maybeParentID
   */
  static isDescendant(maybeChildIDs: string[], maybeParentID: string): boolean {
    // cannot select same folder
    for (var i = 0; i < maybeChildIDs.length; i++) {
      if (maybeChildIDs[i] === maybeParentID) {
        return true;
      }
    }

    var results = [];

    for (i = 0; i < maybeChildIDs.length; i++) {
      // get parents of maybeChildID
      var currentParents = getMetadata(maybeChildIDs[i]).parents;

      // if at root or no parents, stop
      if (!currentParents || currentParents.length === 0) {
        continue;
      }

      // check all parents
      for (i = 0; i < currentParents.length; i++) {
        if (currentParents[i].id === maybeParentID) {
          return true;
        }
      }

      // recursively check the parents of the parents
      results.push(
        FileService.isDescendant(
          currentParents.map(function(f) {
            return f.id;
          }),
          maybeParentID
        )
      );
    }

    // check results array for any positives
    for (i = 0; i < results.length; i++) {
      if (results[i]) {
        return true;
      }
    }
    return false;
  }

  static getFileLinkForSheet(id: string, title?: string): string {
    if (id) {
      return 'https://drive.google.com/open?id=' + id;
    }
    return '';
    // 2018-12-01: different locales use different delimiters. Simplify link so it works everywhere
    // return (
    //   '=HYPERLINK("https://drive.google.com/open?id=' + id + '","' + title + '")'
    // );
  }
}
