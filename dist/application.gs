/**********************************************
 * Namespace for file-related functions
 **********************************************/

function FileService(gDriveService) {
  this.gDriveService = gDriveService;
  this.baseCopyLogID = '17xHN9N5KxVie9nuFFzCur7WkcMP7aLG4xsPis8Ctxjg';
  return this;
}

/**
 * Try to copy file to destination parent, or add new folder if it's a folder
 * @param {Object} file File Resource with metadata from source file
 */
FileService.prototype.copyFile = function(file, properties) {
  // if folder, use insert, else use copy
  if (file.mimeType == 'application/vnd.google-apps.folder') {
    var r = this.gDriveService.insertFolder({
      description: file.description,
      title: file.title,
      parents: [
        {
          kind: 'drive#parentReference',
          id: properties.map[file.parents[0].id]
        }
      ],
      mimeType: 'application/vnd.google-apps.folder'
    });

    // Update list of remaining folders
    properties.remaining.push(file.id);

    // map source to destination
    properties.map[file.id] = r.id;

    return r;
  } else {
    return this.gDriveService.copyFile(
      {
        title: file.title,
        parents: [
          {
            kind: 'drive#parentReference',
            id: properties.map[file.parents[0].id]
          }
        ]
      },
      file.id
    );
  }
};

/**
 * copy permissions from source to destination file/folder
 *
 * @param {string} srcId metadata for the source folder
 * @param {string} owners list of owners of src file
 * @param {string} destId metadata for the destination folder
 */
FileService.prototype.copyPermissions = function(srcId, owners, destId) {
  var permissions, destPermissions, i, j;

  try {
    permissions = this.gDriveService.getPermissions(srcId).items;
  } catch (e) {
    Util.log(null, Util.composeErrorMsg(e));
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
            {
              role: permissions[i].role,
              type: permissions[i].type,
              value: permissions[i].emailAddress
            },
            destId,
            {
              sendNotificationEmails: 'false'
            }
          );
        } else {
          this.gDriveService.insertPermission(
            {
              role: permissions[i].role,
              type: permissions[i].type,
              id: permissions[i].id,
              withLink: permissions[i].withLink
            },
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
          {
            role: 'writer',
            type: 'user',
            value: owners[i].emailAddress
          },
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
    Util.log(null, Util.composeErrorMsg(e));
  }

  if (destPermissions && destPermissions.length > 0) {
    for (i = 0; i < destPermissions.length; i++) {
      for (j = 0; j < permissions.length; j++) {
        if (destPermissions[i].id == permissions[j].id) {
          break;
        }
        // if destPermissions does not exist in permissions, delete it
        if (j == permissions.length - 1 && destPermissions[i].role != 'owner') {
          this.gDriveService.removePermission(destId, destPermissions[i].id);
        }
      }
    }
  }
};

/**
 * Loops through array of files.items,
 * Applies Drive function to each (i.e. copy),
 * Logs result,
 * Copies permissions if selected and if file is a Drive document,
 * Get current runtime and decide if processing needs to stop.
 *
 * @param {Array} items the list of files over which to iterate
 */
FileService.prototype.processFileList = function(
  items,
  properties,
  userProperties,
  timer,
  ss
) {
  while (items.length > 0 && timer.canContinue()) {
    // Get next file from passed file list.
    var item = items.pop();

    // Copy each (files and folders are both represented the same in Google Drive)
    // if error, log and continue
    try {
      var newfile = this.copyFile(item, properties);

      // Log result
      Util.log(ss, [
        'Copied',
        newfile.title,
        FileService.getFileLinkForSheet(newfile.id, newfile.title),
        newfile.id,
        Utilities.formatDate(
          new Date(),
          properties.timeZone,
          'MM-dd-yy hh:mm:ss aaa'
        )
      ]);

      // Copy permissions if selected, and if permissions exist to copy
      if (properties.copyPermissions) {
        if (
          item.mimeType == 'application/vnd.google-apps.document' ||
          item.mimeType == 'application/vnd.google-apps.folder' ||
          item.mimeType == 'application/vnd.google-apps.spreadsheet' ||
          item.mimeType == 'application/vnd.google-apps.presentation' ||
          item.mimeType == 'application/vnd.google-apps.drawing' ||
          item.mimeType == 'application/vnd.google-apps.form' ||
          item.mimeType == 'application/vnd.google-apps.script'
        ) {
          this.copyPermissions(item.id, item.owners, newfile.id);
        }
      }
    } catch (e) {
      Util.log(ss, [
        Util.composeErrorMsg(e)[0],
        item.title,
        FileService.getFileLinkForSheet(item.id, item.title),
        item.id,
        Utilities.formatDate(
          new Date(),
          properties.timeZone,
          'MM-dd-yy hh:mm:ss aaa'
        )
      ]);
    }

    // Update current runtime and user stop flag
    timer.update(userProperties);
  }
};

/**
 * Create the root folder of the new copy.
 * Copy permissions from source folder to destination folder if copyPermissions == yes
 * @param {object} options
 *  {
 *    srcFolderID: string,
 *    srcParentId: string,
 *    srcFolderName: string,
 *    srcFolderURL: string,
 *    destFolderName: string,
 *    copyPermissions: boolean,
 *    copyTo: number,
 *    destParentID: string,
 *  }
 * @param {string} today format mm/dd/yyyy
 * @return {File Resource} metadata for destination folder, or error on failure
 */
FileService.prototype.initializeDestinationFolder = function(options, today) {
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
    throw new Error(
      'Cannot select destination folder that exists within the source folder'
    );
  }

  try {
    destFolder = this.gDriveService.insertFolder({
      description: 'Copy of ' + options.srcFolderName + ', created ' + today,
      title: options.destFolderName,
      parents: [
        {
          kind: 'drive#fileLink',
          id: destParentID
        }
      ],
      mimeType: 'application/vnd.google-apps.folder'
    });
  } catch (e) {
    return e.message;
  }

  if (options.copyPermissions) {
    this.copyPermissions(options.srcFolderID, null, destFolder.id);
  }

  return destFolder;
};

/**
 * Create the spreadsheet used for logging progress of the copy
 * @param {string} today - Stringified version of today's date
 * @param {string} destId - ID of the destination folder, created in createDestinationFolder
 * @return {File Resource} metadata for logger spreadsheet, or error on fail
 */
FileService.prototype.createLoggerSpreadsheet = function(today, destId) {
  try {
    return this.gDriveService.copyFile(
      {
        title: 'Copy Folder Log ' + today,
        parents: [
          {
            kind: 'drive#parentReference',
            id: destId
          }
        ]
      },
      this.baseCopyLogID
    );
  } catch (e) {
    return e.message;
  }
};

/**
 * Create document that is used to store temporary properties information when the app pauses.
 * Create document as plain text.
 * This will be deleted upon script completion.
 * @param {string} destId - the ID of the destination folder
 * @return {File Resource} metadata for the properties document, or error on fail.
 */
FileService.prototype.createPropertiesDocument = function(destId) {
  try {
    var propertiesDoc = this.gDriveService.insertBlankFile(destId);
    return propertiesDoc.id;
  } catch (e) {
    return e.message;
  }
};

/**
 * @returns {object} copy log ID and properties doc ID from a paused folder copy
 */
FileService.prototype.findPriorCopy = function(folderId) {
  // find DO NOT MODIFY OR DELETE file (e.g. propertiesDoc)
  var query =
    "'" +
    folderId +
    "' in parents and title contains 'DO NOT DELETE OR MODIFY' and mimeType = 'text/plain'";
  var p = this.gDriveService.getFiles(query, null, 'modifiedDate,createdDate');

  // find copy log
  query =
    "'" +
    folderId +
    "' in parents and title contains 'Copy Folder Log' and mimeType = 'application/vnd.google-apps.spreadsheet'";
  var s = this.gDriveService.getFiles(query, null, 'title desc');

  try {
    return {
      spreadsheetId: s.items[0].id,
      propertiesDocId: p.items[0].id
    };
  } catch (e) {
    throw new Error(
      'Could not find the necessary data files in the selected folder. ' +
        'Please ensure that you selected the in-progress copy and not the original folder.'
    );
  }
};

// STATIC METHODS
//===============

/**
 * Determines if maybeChildID is a descendant of maybeParentID
 * @param {Array<String>} maybeChildIDs
 * @param {String} maybeParentID
 * @returns {boolean}
 */
FileService.isDescendant = function(maybeChildIDs, maybeParentID) {
  // cannot select same folder
  for (i = 0; i < maybeChildIDs.length; i++) {
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
};

/**
 * @param {string} id
 * @param {string} title
 * @returns {string}
 */
FileService.getFileLinkForSheet = function(id, title) {
  return (
    '=HYPERLINK("https://drive.google.com/open?id=' + id + '","' + title + '")'
  );
};


/**********************************************
 * Namespace to wrap calls to Drive API
 **********************************************/
function GDriveService() {
  return this;
}

/**
 * Returns metadata for input file ID
 * @param {string} id the folder ID for which to return metadata
 * @return {object} the permissions for the folder
 */
GDriveService.prototype.getPermissions = function(id) {
  return Drive.Permissions.list(id);
};

/**
 * Gets files from query and returns fileList with metadata
 * @param {string} query the query to select files from the Drive
 * @param {string} pageToken the pageToken (if any) for the existing query
 * @return {File List} fileList object where fileList.items is an array of children files
 */
GDriveService.prototype.getFiles = function(query, pageToken, orderBy) {
  return Drive.Files.list({
    q: query,
    maxResults: 1000,
    pageToken: pageToken,
    orderBy: orderBy
  });
};

/**
 * Download contents of file
 * @param {string} id
 * @returns {File Resource}
 */
GDriveService.prototype.downloadFile = function(id) {
  return Drive.Files.get(id, { alt: 'media' });
};

/**
 * Updates a file's content and metadata
 * @param {Object} metadata
 * @param {string} fileID
 * @param {Blob} mediaData
 * @returns {File Resource}
 */
GDriveService.prototype.updateFile = function(metadata, fileID, mediaData) {
  return Drive.Files.update(metadata, fileID, mediaData);
};

/**
 * Insert a file with metadata defined by `body`
 * @param {object} body
 * @returns {File Resource}
 */
GDriveService.prototype.insertFolder = function(body) {
  return Drive.Files.insert(body);
};

/**
 * Insert file with fixed metadata used to store properties
 * @param {string} parentID ID to insert the file beneath
 * @returns {File Resource}
 */
GDriveService.prototype.insertBlankFile = function(parentID) {
  return this.insertFolder({
    description:
      'This document will be deleted after the folder copy is complete. It is only used to store properties necessary to complete the copying procedure',
    title: 'DO NOT DELETE OR MODIFY - will be deleted after copying completes',
    parents: [
      {
        kind: 'drive#fileLink',
        id: parentID
      }
    ],
    mimeType: 'text/plain'
  });
};

/**
 * @param {File Resource} body details for the copied file
 * @param {string} id file to copy
 * @returns {File Resource}
 */
GDriveService.prototype.copyFile = function(body, id) {
  return Drive.Files.copy(body, id);
};

/**
 * Inserts a permission on a file
 * @param {object} body metadata for permission
 * @param {string} id file ID to insert permissions
 * @param {object} options
 */
GDriveService.prototype.insertPermission = function(body, id, options) {
  return Drive.Permissions.insert(body, id, options);
};

/**
 * Removes one permission from file
 * @param {string} fileID
 * @param {string} permissionID
 */
GDriveService.prototype.removePermission = function(fileID, permissionID) {
  return Drive.Permissions.remove(fileID, permissionID);
};

/**
 * @returns {string} ID of root Drive folder
 */
GDriveService.prototype.getRootID = function() {
  return DriveApp.getRootFolder().getId();
};


/**********************************************
 * Contains runtime properties for script
 **********************************************/

function Properties(gDriveService) {
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
  this.leftovers = {};
  this.map = {};
  this.remaining = [];
  this.timeZone = 'GMT-7';
  this.totalRuntime = 0;

  return this;
}

/**
 * Load properties document from user's drive and parse.
 * @return {object} properties object
 */
Properties.prototype.load = function() {
  var _this = this;
  try {
    var propertiesDocId = PropertiesService.getUserProperties().getProperties()
      .propertiesDocId;
    var propertiesDoc = this.gDriveService.downloadFile(propertiesDocId);
  } catch (e) {
    if (e.message.indexOf('Unsupported Output Format') !== -1) {
      throw new Error(
        'Could not determine properties document ID. Please try running the script again'
      );
    }
    throw e;
  }

  try {
    var properties = JSON.parse(propertiesDoc);
  } catch (e) {
    throw new Error(
      "Unable to parse the properties document. This is likely a bug, but it is worth trying one more time to make sure it wasn't a fluke."
    );
  }

  Object.keys(properties).forEach(function(prop) {
    try {
      _this[prop] = properties[prop];
    } catch (e) {
      throw new Error(
        'Error loading property ' +
          prop +
          ' to properties object. Attempted to save: ' +
          properties[prop]
      );
    }
  });

  return this;
};

/**
 * Increment `totalRuntime` property
 * @param {number} ms amount in milliseconds to increment
 */
Properties.prototype.incrementTotalRuntime = function(ms) {
  this.totalRuntime += ms;
};

/**
 * Determine if script has exceeded max daily runtime
 * If yes, need to sleep for one day to avoid throwing
 * "Script using too much computer time" error
 * @returns {boolean}
 */
Properties.prototype.checkMaxRuntime = function() {
  this.isOverMaxRuntime =
    this.totalRuntime + Timer.MAX_RUNTIME >= Timer.MAX_RUNTIME_PER_DAY;
  return this.isOverMaxRuntime;
};

/**
 * Stringify properties argument and save to file in user's Drive
 *
 * @param {object} properties - contains all properties that need to be saved to userProperties
 */
Properties.save = function(properties, gDriveService) {
  try {
    var stringifiedProps = JSON.stringify(properties);
  } catch (e) {
    throw new Error(
      'Failed to serialize script properties. This is a critical failure. Please start your copy again.'
    );
  }
  return gDriveService.updateFile(
    {
      upload: 'multipart',
      alt: 'json'
    },
    properties.propertiesDocId,
    Utilities.newBlob(stringifiedProps)
  );
};

/**
 * save srcId, destId, copyPermissions, spreadsheetId to userProperties.
 *
 * This is used when resuming, in which case the IDs of the logger spreadsheet and
 * properties document will not be known.
 */
Properties.setUserPropertiesStore = function(
  spreadsheetId,
  propertiesDocId,
  destId,
  resuming
) {
  var userProperties = PropertiesService.getUserProperties();
  userProperties.setProperty('destId', destId);
  userProperties.setProperty('spreadsheetId', spreadsheetId);
  userProperties.setProperty('propertiesDocId', propertiesDocId);
  userProperties.setProperty('trials', 0);
  userProperties.setProperty('resuming', resuming);
  userProperties.setProperty('stop', 'false');
};


/**********************************************
 * Tracks runtime of application to avoid
 * exceeding Google quotas
 **********************************************/

function Timer() {
  this.START_TIME = new Date().getTime();
  this.runtime = 0;
  this.timeIsUp = false;
  this.stop = false;

  return this;
}

// Max runtime per day is 90 minutes. Set max as 88 mins for padding.
// https://developers.google.com/apps-script/guides/services/quotas
Timer.MAX_RUNTIME_PER_DAY = 88 * 1000 * 60;
Timer.MAX_RUNTIME = 4.7 * 1000 * 60;
// durations used for setting Triggers
Timer.oneDay = 24 * 60 * 60 * 1000;
Timer.sixMinutes = 6.2 * 1000 * 60;

/**
 * Update current time
 * @param {UserPropertiesService} userProperties
 */
Timer.prototype.update = function(userProperties) {
  this.runtime = this.now() - this.START_TIME;
  this.timeIsUp = this.runtime >= Timer.MAX_RUNTIME;
  this.stop = userProperties.getProperty('stop') == 'true';
};

/**
 * @returns {boolean}
 */
Timer.prototype.canContinue = function() {
  return !this.timeIsUp && !this.stop;
};

/**
 * @returns {number}
 */
Timer.prototype.now = function() {
  return new Date().getTime();
};

/**
 * Calculate how far in the future the trigger should be set
 * @param {Properties} properties
 * @returns {number}
 */
Timer.prototype.calculateTriggerDuration = function(properties) {
  return properties.checkMaxRuntime()
    ? Timer.oneDay
    : Timer.sixMinutes - this.runtime;
};


/**********************************************
 * Namespace for trigger-related methods
 **********************************************/
var TriggerService = {};

/**
 * Create a trigger to run copy() in 121 seconds.
 * Save trigger ID to userProperties so it can be deleted later
 */
TriggerService.createTrigger = function(duration) {
  // default is 6.2 minutes from now
  // Timer will stop execution after 4.7 minutes, so this gives about 1.5 minutes buffer
  duration = duration || Timer.sixMinutes;
  var trigger = ScriptApp.newTrigger('copy')
    .timeBased()
    .after(duration)
    .create();

  if (trigger) {
    // Save the triggerID so this trigger can be deleted later
    PropertiesService.getUserProperties().setProperty(
      'triggerId',
      trigger.getUniqueId()
    );
  }
};

/**
 * Loop over all triggers
 * Delete if trigger ID matches parameter triggerId
 * @param {string} triggerId unique identifier for active trigger
 */
TriggerService.deleteTrigger = function(triggerId) {
  if (triggerId !== undefined && triggerId !== null) {
    try {
      // Loop over all triggers.
      var allTriggers = ScriptApp.getProjectTriggers();
      for (var i = 0; i < allTriggers.length; i++) {
        // If the current trigger is the correct one, delete it.
        if (allTriggers[i].getUniqueId() == triggerId) {
          ScriptApp.deleteTrigger(allTriggers[i]);
          break;
        }
      }
    } catch (e) {
      Util.log(null, Util.composeErrorMsg(e));
    }
  }
};


/**********************************************
 * Namespace to wrap utility functions
 **********************************************/
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
 * @param {object} ss instance of Sheet class representing the logger spreadsheet
 * @param {Array} values array of values to be written to the spreadsheet
 */
Util.log = function(ss, values) {
  if (ss === null || ss === undefined) {
    ss = SpreadsheetApp.openById(
      PropertiesService.getUserProperties().getProperty('spreadsheetId')
    ).getSheetByName('Log');
  }

  // avoid placing entries that are too long
  values = values.map(function(cell) {
    return cell.slice(0, 4999);
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
      [
        'The spreadsheet is too large to continue logging, but the service will continue to run in the background'
      ]
    ]);
  }
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
 * Save properties and update log
 * @param {Properties} properties
 * @param {File List} fileList
 * @param {string} logMessage - The message to output to the log when state is saved
 * @param {Sheet} ss spreadsheet instance
 */
Util.saveState = function(properties, fileList, logMessage, ss, gDriveService) {
  // save, create trigger, and assign pageToken for continuation
  try {
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
      Util.log(ss, [
        'You have run out of space in your Drive! ' +
          'You should delete some files and then come back ' +
          'and use the "Resume" feature to restart your copy.'
      ]);
      Util.log(ss, [
        'HEADS UP! Your most recently copied files WILL BE DUPLICATED if you resume. ' +
          'To avoid duplicating, you will need to restart your copy from the beginning'
      ]);
      // return early to prevent logging `logMessage`
      return;
    }
    Util.log(
      ss,
      Util.composeErrorMsg(
        e,
        'Failed to save properties. ' +
          'This could affect script performance and may require restarting the copy. ' +
          'Error Message: '
      )
    );
  }

  Util.log(ss, [logMessage]);
};

Util.cleanup = function(
  properties,
  fileList,
  userProperties,
  timer,
  ss,
  gDriveService
) {
  // track totalRuntime to avoid exceeding quota
  properties.incrementTotalRuntime(timer.runtime);

  // Set the stop message that will be displayed to user on script pause
  var stopMsg = Util.msgs.singleRunExceeded;
  if (timer.stop) {
    // user manually stopped script
    stopMsg = Util.msgs.userStoppedScript;
    TriggerService.deleteTrigger(userProperties.getProperty('triggerId'));
  } else if (properties.isOverMaxRuntime) {
    // daily runtime exceeded.
    stopMsg = Util.msgs.maxRuntimeExceeded;
    // Reset totalRuntime - next trigger will be 24 hours in future
    properties.totalRuntime = 0;
  }

  // Either stop flag or runtime exceeded. Must save state
  if (!timer.canContinue()) {
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
      Util.log(ss, Util.composeErrorMsg(e));
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


/**********************************************
 * Main copy loop
 **********************************************/

/**
 * Copy folders and files from source to destination.
 * Get parameters from userProperties,
 * Loop until time runs out,
 * then call timeout methods, save and createTrigger.
 *
 * @param {boolean} resuming whether or not the copy call is resuming an existing folder copy or starting fresh
 */
function copy() {
  // initialize vars
  var gDriveService = new GDriveService(),
    properties = new Properties(gDriveService),
    timer = new Timer(),
    ss, // {object} instance of Sheet class
    query, // {string} query to generate Files list
    fileList, // {object} list of files within Drive folder
    currFolder, // {object} metadata of folder whose children are currently being processed
    userProperties = PropertiesService.getUserProperties(), // reference to userProperties store
    triggerId = userProperties.getProperty('triggerId'), // {string} Unique ID for the most recently created trigger
    fileService = new FileService(gDriveService);

  // Delete previous trigger
  TriggerService.deleteTrigger(triggerId);

  // Load properties.
  // If loading properties fails, return the function and
  // set a trigger to retry in 6 minutes.
  try {
    Util.exponentialBackoff(
      properties.load.bind(properties),
      'Error restarting script, trying again...'
    );
  } catch (e) {
    var n = Number(userProperties.getProperties().trials);
    Logger.log(n);

    if (n < 5) {
      Logger.log('setting trials property');
      userProperties.setProperty('trials', (n + 1).toString());

      Util.exponentialBackoff(
        TriggerService.createTrigger,
        'Error setting trigger.  There has been a server error with Google Apps Script.' +
          'To successfully finish copying, please refresh the app and click "Resume Copying"' +
          'and follow the instructions on the page.'
      );
    }
    return;
  }

  // Initialize logger spreadsheet
  try {
    ss = SpreadsheetApp.openById(properties.spreadsheetId).getSheetByName(
      'Log'
    );
  } catch (e) {
    try {
      ss = SpreadsheetApp.openById(
        PropertiesService.getUserProperties().getProperty('spreadsheetId')
      ).getSheetByName('Log');
    } catch (e) {
      // if the spreadsheet cannot be accessed, this should be considered a fatal error
      // and the script should not continue
      throw new Error('Cannot locate spreadsheet. Please try again.');
    }
  }

  // Create trigger for next run.
  // This trigger will be deleted if script finishes successfully
  // or if the stop flag is set.
  timer.update(userProperties);
  var duration = timer.calculateTriggerDuration(properties);
  TriggerService.createTrigger(duration);

  // Process leftover files from prior query results
  // that weren't processed before script timed out.
  // Destination folder must be set to the parent of the first leftover item.
  // The list of leftover items is an equivalent array to fileList returned from the getFiles() query
  if (
    properties.leftovers &&
    properties.leftovers.items &&
    properties.leftovers.items.length > 0
  ) {
    properties.destFolder = properties.leftovers.items[0].parents[0].id;
    fileService.processFileList(
      properties.leftovers.items,
      properties,
      userProperties,
      timer,
      ss
    );
  }

  // Update current runtime and user stop flag
  timer.update(userProperties);

  // When leftovers are complete, query next folder from properties.remaining
  while (properties.remaining.length > 0 && timer.canContinue()) {
    // if pages remained in the previous query, use them first
    if (properties.pageToken) {
      currFolder = properties.destFolder;
    } else {
      // TODO: This is throwing tons of errors but I don't know why.
      // for some reason properties.remaining is not being parsed correctly,
      // so it's a JSON stringy object instead of an actual array.
      try {
        currFolder = properties.remaining.shift();
      } catch (e) {
        console.error('properties.remaining is not parsed correctly');
        console.error(e);
        properties.remaining = JSON.parse(properties.remaining);
        currFolder = properties.remaining.shift();
      }
    }

    // build query
    query = '"' + currFolder + '" in parents and trashed = false';

    // Query Drive to get the fileList (children) of the current folder, currFolder
    // Repeat if pageToken exists (i.e. more than 1000 results return from the query)
    do {
      try {
        fileList = gDriveService.getFiles(query, properties.pageToken);
      } catch (e) {
        Util.log(ss, Util.composeErrorMsg(e));
      }
      if (!fileList) {
        console.log('fileList is undefined. currFolder:', currFolder);
      }

      // Send items to processFileList() to copy if there is anything to copy
      if (fileList && fileList.items && fileList.items.length > 0) {
        fileService.processFileList(
          fileList.items,
          properties,
          userProperties,
          timer,
          ss
        );
      } else {
        Logger.log('No children found.');
      }

      // get next page token to continue iteration
      properties.pageToken = fileList ? fileList.nextPageToken : null;

      timer.update(userProperties);
    } while (properties.pageToken && timer.canContinue());
  }

  // Cleanup
  Util.cleanup(properties, fileList, userProperties, timer, ss, gDriveService);
}

/**********************************************
 * These functions are called from the front end via
 * google.script.run
 *
 * They need to be globally available so the calls work as expected
 **********************************************/

/**
 * Serves HTML of the application for HTTP GET requests.
 * If folderId is provided as a URL parameter, the web app will list
 * the contents of that folder (if permissions allow). Otherwise
 * the web app will list the contents of the root folder.
 *
 * @param {Object} e event parameter that can contain information
 *     about any URL parameters provided.
 */
function doGet(e) {
  var template = HtmlService.createTemplateFromFile('Index');

  // Build and return HTML in IFRAME sandbox mode.
  return template
    .evaluate()
    .setTitle('Copy a Google Drive folder')
    .setSandboxMode(HtmlService.SandboxMode.IFRAME);
}

/**
 * Initialize destination folder, logger spreadsheet, and properties doc.
 * Build/add properties to options so it can be saved to the properties doc.
 * Set UserProperties values and save properties to propertiesDoc.
 * Add link for destination folder to logger spreadsheet.
 * Return IDs of created destination folder and logger spreadsheet
 *
 * @param {object} options
 *  {
 *    srcFolderID: string,
 *    srcParentId: string,
 *    srcFolderName: string,
 *    srcFolderURL: string,
 *    destFolderName: string,
 *    copyPermissions: boolean,
 *    copyTo: number,
 *    destParentID: string,
 *  }
 */
function initialize(options) {
  var destFolder, // {Object} instance of Folder class representing destination folder
    spreadsheet, // {Object} instance of Spreadsheet class
    propertiesDocId, // {Object} metadata for Google Document created to hold properties
    today = Utilities.formatDate(new Date(), 'GMT-5', 'MM-dd-yyyy'), // {string} date of copy
    gDriveService = new GDriveService(),
    fileService = new FileService(gDriveService);

  // Create Files used in copy process
  destFolder = fileService.initializeDestinationFolder(options, today);
  spreadsheet = fileService.createLoggerSpreadsheet(today, destFolder.id);
  propertiesDocId = fileService.createPropertiesDocument(destFolder.id);

  // Build/add properties to options so it can be saved to the properties doc
  options.destId = destFolder.id;
  options.spreadsheetId = spreadsheet.id;
  options.propertiesDocId = propertiesDocId;

  // initialize map with top level source and destination folder
  options.leftovers = {}; // {Object} FileList object (returned from Files.list) for items not processed in prior execution (filled in saveState)
  options.map = {}; // {Object} map of source ids (keys) to destination ids (values)
  options.map[options.srcFolderID] = options.destId;
  options.remaining = [options.srcFolderID];

  // Add link for destination folder to logger spreadsheet
  try {
    SpreadsheetApp.openById(spreadsheet.id)
      .getSheetByName('Log')
      .getRange(2, 5)
      .setValue(
        '=HYPERLINK("https://drive.google.com/open?id=' +
          destFolder.id +
          '","' +
          options.destFolderName +
          '")'
      );
  } catch (e) {
    console.error('unable to set folder URL in copy log');
    console.error(e);
  }

  // 2018-09-06: this often throws a "Bad Value" error, not sure of the cause
  // but this data is low importance
  try {
    options.timeZone = SpreadsheetApp.openById(
      spreadsheet.id
    ).getSpreadsheetTimeZone();
  } catch (e) {
    options.timeZone = 'GMT-7';
  }

  // Adding a row to status list prevents weird style copying in Util.log
  try {
    SpreadsheetApp.openById(spreadsheet.id)
      .getSheetByName('Log')
      .getRange(5, 1, 1, 5)
      .setValues([
        [
          'Started copying',
          '',
          '',
          '',
          Utilities.formatDate(
            new Date(),
            options.timeZone,
            'MM-dd-yy hh:mm:ss aaa'
          )
        ]
      ]);
  } catch (e) {
    console.error('unable to write "started copying"');
    console.error(e);
  }

  // Set UserProperties values and save properties to propertiesDoc
  Properties.setUserPropertiesStore(
    options.spreadsheetId,
    options.propertiesDocId,
    options.destId,
    'false'
  );
  Properties.save(options, gDriveService);

  // Delete all existing triggers so no scripts overlap
  deleteAllTriggers();

  // Return IDs of created destination folder and logger spreadsheet
  return {
    spreadsheetId: options.spreadsheetId,
    destFolderId: options.destId,
    resuming: false
  };
}

/**
 * @param {string} id the folder ID for which to return metadata
 * @param {string} url the folder URL
 * @returns {object} the metadata for the folder (File Resource)
 */
function getMetadata(id, url) {
  try {
    return Drive.Files.get(id);
  } catch (e) {
    var errMsg =
      'Unable to find a folder with the supplied URL. ' +
      'You submitted ' +
      url +
      '. ' +
      'Please verify that you are using a valid folder URL and try again.';
    throw new Error(errMsg);
  }
}

/**
 * @returns {string} email of the active user
 */
function getUserEmail() {
  return Session.getActiveUser().getEmail();
}

/**
 * Find prior copy folder instance.
 * Find propertiesDoc and logger spreadsheet, and save IDs to userProperties, which will be used by load.
 *
 * @param options object containing information on folder selected in app
 * @returns {{spreadsheetId: string, destId: string, resuming: boolean}}
 */

function resume(options) {
  var gDriveService = new GDriveService(),
    fileService = new FileService(gDriveService);
  var priorCopy = fileService.findPriorCopy(options.srcFolderID);

  Properties.setUserPropertiesStore(
    priorCopy.spreadsheetId,
    priorCopy.propertiesDocId,
    options.destFolderId,
    'true'
  );

  return {
    spreadsheetId: priorCopy.spreadsheetId,
    destFolderId: options.srcFolderID,
    resuming: true
  };
}

/**
 * Set a flag in the userProperties store that will cancel the current copy folder process
 */
function setStopFlag() {
  return PropertiesService.getUserProperties().setProperty('stop', 'true');
}

/**
 * Loop over all triggers and delete
 */
function deleteAllTriggers() {
  var allTriggers = ScriptApp.getProjectTriggers();
  for (var i = 0; i < allTriggers.length; i++) {
    ScriptApp.deleteTrigger(allTriggers[i]);
  }
}

/**
 * @return {number} number of active triggers for this user
 */
function getTriggersQuantity() {
  return ScriptApp.getProjectTriggers().length;
}

/**
 * @returns {string} token for use with Google Picker
 */
function getOAuthToken() {
  return ScriptApp.getOAuthToken();
}
