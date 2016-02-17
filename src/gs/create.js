/**
 * Traverses the folder tree of source folder and
 * creates copy of folder tree in destination folder.
 *
 * @param {Object} selectedFolder
 */

/* eric's notes for function flow


*/


function createFolders(selectedFolder) {
    var timeIsUp,       // {boolean}
        currTime;       // {number}
    
    
    const MAX_RUNNING_TIME = 5.7 * 60 * 1000;   // 5.7 minutes in milliseconds
    const START_TIME = (new Date()).getTime();
    
    
    // get src folder and create dest folder if no continuation tokens exist
    
    
    while ( srcChildren.hasNext() && !timeIsUp ) {
        
        // get folder and folder's children for current iteration
        srcNextChild = srcChildren.next();
        grandchildren = srcNextChild.getFolders();
        
        // create dest copy of nextChild
        destNextChild = newFolder = DriveApp.getFolderById(parentId).createFolder(newFolderName);
        
        // get time information; max runtime = 6 mins
        currTime = (new Date()).getTime();
        timeIsUp = (currTime - START_TIME >= MAX_RUNNING_TIME);
        
        // add srcFolderId, destFolderId, and srcFolderName to folderTree
        
        
        
    } 
    
    
}


function DEPRECATEDcreateFolders(folderId, newFolderName, parentId, folderTree, copyPermissions, added, dest) {
  
  /** 
   * Create variables for script
   */
  
  var oldFolder = DriveApp.getFolderById(folderId);
  var folders = oldFolder.getFolders();
  var pair, results, newFolder;
  
  
  
  /** 
   * Create new folder from source folder
   */ 
  
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
  
  
  
  
  
  // Loop through children
  while (folders.hasNext()) {
    var child = folders.next();
    var childId = child.getId();
    var childName = child.getName();
    // create child
    createFolders(childId, childName, newFolder.getId(), folderTree, copyPermissions, added);
  }
  
  
  
  /** 
   * Build folderTree for file copying
   * and add relevant info to results
   */
  
  pair = [ folderId, newFolderId, newFolderName ];
  folderTree.push(pair);
  
  
  results = {
    newFolderId: newFolderId, 
    folderTree: folderTree, 
    copyPermissions: copyPermissions, 
    added: added
  }
  
  return results;
}
