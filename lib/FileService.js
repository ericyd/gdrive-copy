/**********************************************
 * Namespace for file-related functions
 **********************************************/

//removeIf(production)
// Google Apps Script doesn't play well with module.exports,
// but it is required for testing
const Util = require('./Util');
//endRemoveIf(production)

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

//removeIf(production)
// Google Apps Script doesn't play well with module.exports,
// but it is required for testing
module.exports = FileService;
//endRemoveIf(production)
