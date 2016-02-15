/**
 * Traverses the folder tree of source folder and
 * creates copy of folder tree in destination folder.
 *
 * @param {Object} e 
 */

function createFolders(folderId, newFolderName, parentId, folderTree, copyPermissions, added, dest) {
  var oldFolder = DriveApp.getFolderById(folderId);
  var folders = oldFolder.getFolders();
  var pair = [];
  var results = [];
  var newFolder;

  // If the folder doesn't have a parent (top folder only), create a new one with the new folder name
  // otherwise, create a folder within the parent folder using the original folder's name
  if (dest == "root") {
    newFolder = DriveApp.createFolder(newFolderName);
  } else if(dest == "same") {
    newFolder = DriveApp.getFolderById(parentId).createFolder(newFolderName);
  } else {
    // Change to new dest id when third option is added
    newFolder = DriveApp.getFolderById(parentId).createFolder(newFolderName);
  }
  var newFolderId = newFolder.getId();
  
  // Copy Permissions if option is selected
  if (copyPermissions) {
    // added is an array of emails that have already been "added" to sharing permissions
    // it effectively lists the emails to skip, so that a million emails aren't sent to declar sharing permissions
    added.push(Session.getActiveUser().getEmail());
    var oldFolderEditors = oldFolder.getEditors();
    oldFolderEditors.push(oldFolder.getOwner());
    var oldFolderViewers = oldFolder.getViewers();
    
    for (i = 0; i < oldFolderEditors.length; i++) {
      if (added.indexOf(oldFolderEditors[i].getEmail()) == -1) {
        newFolder.addEditor(oldFolderEditors[i]);
        added.push(oldFolderEditors[i].getEmail());
      }
    }
    
    for (i = 0; i < oldFolderViewers.length; i++) {
      if (added.indexOf(oldFolderViewers[i].getEmail()) == -1) {
        newFolder.addViewer(oldFolderViewers[i]);
        added.push(oldFolderEditors[i].getEmail());
      }
    }
  } //if (copyPermissions)
  
  // get the full pathname for printing status
  var fullPath = getFullPath("", newFolderId);
  fullPath = fullPath + newFolderName;
  Logger.log("finished top folder");
  // Loop through children
  while (folders.hasNext()) {
    Logger.log("first child folder");
    var child = folders.next();
    var childId = child.getId();
    var childName = child.getName();
    // create child
    createFolders(childId, childName, newFolder.getId(), folderTree, copyPermissions, added);
  }
  
  // create folderTree for file copying
  pair.push(folderId);
  pair.push(newFolderId);
  pair.push(fullPath);
  folderTree.push(pair);
  
  // push results for file copying
  results.push(newFolderId);
  results.push(folderTree);
  results.push(copyPermissions);
  results.push(added);
  
  return results;
}
