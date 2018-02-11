function FileService() {
  return this;
}

// STATIC METHODS
//============================

/**
 * Try to copy file to destination parent.
 * Success:
 *   1. Log success in spreadsheet with file ID
 * Failure:
 *   1. Log error in spreadsheet with source ID
 *
 * @param {Object} file File Resource with metadata from source file
 */
FileService.copyFile = function(file, map) {
  // if folder, use insert, else use copy
  if (file.mimeType == 'application/vnd.google-apps.folder') {
    try {
      var r = GDriveService.insertFolder({
        description: file.description,
        title: file.title,
        parents: [
          {
            kind: 'drive#fileLink',
            id: map[file.parents[0].id]
          }
        ],
        mimeType: 'application/vnd.google-apps.folder'
      });

      // Update list of remaining folders
      // note: properties is a global object found in ./properties/propertiesObject.js
      properties.remaining.push(file.id);

      // map source to destination
      map[file.id] = r.id;

      return r;
    } catch (err) {
      log(null, [err.message, err.fileName, err.lineNumber]);
      return err;
    }
  } else {
    try {
      return GDriveService.copyFile(
        {
          title: file.title,
          parents: [
            {
              kind: 'drive#fileLink',
              id: map[file.parents[0].id]
            }
          ]
        },
        file.id
      );
    } catch (err) {
      log(null, [err.message, err.fileName, err.lineNumber]);
      return err;
    }
  }
};

/**
 * copy permissions from source to destination file/folder
 *
 * @param {string} srcId metadata for the source folder
 * @param {string} owners list of owners of src file
 * @param {string} destId metadata for the destination folder
 */
FileService.copyPermissions = function(srcId, owners, destId) {
  var permissions, destPermissions, i, j;

  try {
    permissions = GDriveService.getPermissions(srcId).items;
  } catch (err) {
    log(null, [err.message, err.fileName, err.lineNumber]);
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

          GDriveService.insertPermission(
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
          GDriveService.insertPermission(
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
      } catch (err) {}
    }
  }

  // convert old owners to editors
  if (owners && owners.length > 0) {
    for (i = 0; i < owners.length; i++) {
      try {
        GDriveService.insertPermission(
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
      } catch (err) {}
    }
  }

  // remove permissions that exist in dest but not source
  // these were most likely inherited from parent

  try {
    destPermissions = GDriveService.getPermissions(destId).items;
  } catch (err) {
    log(null, [err.message, err.fileName, err.lineNumber]);
  }

  if (destPermissions && destPermissions.length > 0) {
    for (i = 0; i < destPermissions.length; i++) {
      for (j = 0; j < permissions.length; j++) {
        if (destPermissions[i].id == permissions[j].id) {
          break;
        }
        // if destPermissions does not exist in permissions, delete it
        if (j == permissions.length - 1 && destPermissions[i].role != 'owner') {
          GDriveService.removePermission(destId, destPermissions[i].id);
        }
      }
    }
  }
};

/**
 * Create the spreadsheet used for logging progress of the copy
 *
 * @param {string} today - Stringified version of today's date
 * @param {string} destId - ID of the destination folder, created in createDestinationFolder
 *
 * @return {Object} metadata for logger spreadsheet, or error on fail
 */
FileService.createLoggerSpreadsheet = function(today, destId) {
  try {
    return GDriveService.copyFile(
      {
        title: 'Copy Folder Log ' + today,
        parents: [
          {
            kind: 'drive#fileLink',
            id: destId
          }
        ]
      },
      '17xHN9N5KxVie9nuFFzCur7WkcMP7aLG4xsPis8Ctxjg'
    );
  } catch (err) {
    return err.message;
  }
};

/**
 * Create document that is used to store temporary properties information when the app pauses.
 * Create document as plain text.
 * This will be deleted upon script completion.
 *
 * @param {string} destId - the ID of the destination folder
 * @return {Object} metadata for the properties document, or error on fail.
 */
FileService.createPropertiesDocument = function(destId) {
  try {
    var propertiesDoc = GDriveService.insertBlankFile(destID);
    propertiesDoc.setDescription(
      'This document will be deleted after the folder copy is complete.  It is only used to store properties necessary to complete the copying procedure'
    );
    return propertiesDoc.getId();
  } catch (err) {
    return err.message;
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
 * @return {Object} metadata for destination folder, or error on failure
 */
FileService.initializeDestinationFolder = function(options, today) {
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
      destParentID = GDriveService.getRootID();
  }

  if (
    options.copyTo === 'custom' &&
    isDescendant([options.destParentID], options.srcFolderID)
  ) {
    throw new Error(
      'Cannot select destination folder that exists within the source folder'
    );
  }

  try {
    destFolder = GDriveService.insertFolder({
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
  } catch (err) {
    return err.message;
  }

  if (options.copyPermissions) {
    FileServic.copyPermissions(options.srcFolderID, null, destFolder.id);
  }

  return destFolder;
};

/**
 * Determines if maybeChildID is a descendant of maybeParentID
 * @param {Array<String>} maybeChildIDs
 * @param {String} maybeParentID
 * @returns {boolean}
 */
function isDescendant(maybeChildIDs, maybeParentID) {
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
    if (currentParents.length === 0) {
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
      isDescendant(
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

/**
 * Created by eric on 5/18/16.
 */
/**
 * Returns copy log ID and properties doc ID from a paused folder copy.
 */
function findPriorCopy(folderId) {
  // find DO NOT MODIFY OR DELETE file (e.g. propertiesDoc)
  var query =
    "'" +
    folderId +
    "' in parents and title contains 'DO NOT DELETE OR MODIFY' and mimeType = 'text/plain'";
  // TODO: refactor to use GDriveService
  var p = Drive.Files.list({
    q: query,
    maxResults: 1000,
    orderBy: 'modifiedDate,createdDate'
  });

  // find copy log
  query =
    "'" +
    folderId +
    "' in parents and title contains 'Copy Folder Log' and mimeType = 'application/vnd.google-apps.spreadsheet'";
  var s = Drive.Files.list({
    q: query,
    maxResults: 1000,
    orderBy: 'title desc'
  });

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
}



//removeIf(production)
// Google Apps Script doesn't play well with module.exports,
// but it is required for testing
module.exports = FileService;
//endRemoveIf(production)