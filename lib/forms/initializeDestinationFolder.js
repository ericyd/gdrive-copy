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
function initializeDestinationFolder(options, today) {
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
      destParentID = DriveApp.getRootFolder().getId();
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
    destFolder = Drive.Files.insert({
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
    copyPermissions(options.srcFolderID, null, destFolder.id);
  }

  return destFolder;
}

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

  var results =[];

  for (i = 0; i < maybeChildIDs.length; i++) {
    // get parents of maybeChildID
    var currentParents = getMetadata(maybeChildIDs[i]).parents;

    // if at root or no parents, stop
    if (currentParents.length === 0) {
      return false;
    }
    
    // check all parents
    for (i = 0; i < currentParents.length; i++) {
      if (currentParents[i].id === maybeParentID) {
        return true;
      }
    }

    // recursively check the parents of the parents
    results.push(isDescendant(currentChild.parents, maybeParentID));
  }

  // check results array for any positives
  for (i = 0; i < results.length; i++) {
    if (results[i]) {
      return true;
    }
  }
  return false;
}
