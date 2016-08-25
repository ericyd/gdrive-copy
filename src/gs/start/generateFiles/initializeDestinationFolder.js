/**
 * Create the root folder of the new copy.
 * Copy permissions from source folder to destination folder if copyPermissions == yes
 * 
 * @param {string} srcName - Name of the source folder
 * @param {string} destName - Name of the destination folder being created
 * @param {string} destLocation - "same" results in folder being created in the same parent as source folder, 
 *      "root" results in folder being created at root of My Drive
 * @param {string} srcParentId - ID of the parent of the source folder
 * @return {Object} metadata for destination folder, or error on failure
 */
function initializeDestinationFolder(srcName, destName, destLocation, srcParentId, srcId) {
    var destFolder;

    try {
        destFolder = Drive.Files.insert({
            "description": "Copy of " + srcName + ", created " + today,
            "title": destName,
            "parents": [
                {
                    "kind": "drive#fileLink",
                    "id": destLocation == "same" ? srcParentId : DriveApp.getRootFolder().getId()
                }
            ],
            "mimeType": "application/vnd.google-apps.folder"
        });   
    }
    catch(err) {
        return err.message;
    }

    if (selectedFolder.permissions) {
        copyPermissions(srcId, null, destFolder.id);
    }

    return destFolder;
}
