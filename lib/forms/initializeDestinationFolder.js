/**
 * Create the root folder of the new copy.
 * Copy permissions from source folder to destination folder if copyPermissions == yes
 * @param {object} options
 * - srcFolderName: string
 * - destFolderName: string
 * - copyToRoot: boolean
 * - copyPermissions: boolean
 * - srcParentID: string
 * @param {string} today format mm/dd/yyyy
 * @return {Object} metadata for destination folder, or error on failure
 */
function initializeDestinationFolder(options, today) {
  var destFolder;

  try {
    destFolder = Drive.Files.insert({
      description: 'Copy of ' + options.srcFolderName + ', created ' + today,
      title: options.destFolderName,
      parents: [
        {
          kind: 'drive#fileLink',
          id: options.copyToRoot
            ? DriveApp.getRootFolder().getId()
            : options.srcParentID
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
