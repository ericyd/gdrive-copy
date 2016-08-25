/**
 * Create the root folder of the new copy
 * 
 * @param {string} srcName - Name of the source folder
 * @param {string} destName - Name of the destination folder being created
 * @param {string} destLocation - "same" results in folder being created in the same parent as source folder, 
 *      "root" results in folder being created at root of My Drive
 * @param {string} srcParentId - ID of the parent of the source folder
 * @return {Object} metadata for destination folder, or error on failure
 */
function createDestinationFolder(srcName, destName, destLocation, srcParentId) {
    try {
        return Drive.Files.insert({
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
}
