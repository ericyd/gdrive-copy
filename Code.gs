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
 
  template.thisForm = e.parameter.thisForm;
  
  // Build and return HTML in IFRAME sandbox mode.
  return template.evaluate()
      .setTitle('Copy a Google Drive folder')
      .setSandboxMode(HtmlService.SandboxMode.IFRAME);
}


/**
 * Get contents of folder and copy to new folder
 * If sub folders exist, it will recursively copy sub-folders too
 */

// Gets the values from the form for folderId and newFolderId and returns them
function getValues(theForm) {
  var folderId = theForm.folderId;
  var folderName = DriveApp.getFolderById(folderId).getName();
  var newFolderName = theForm.newFolder;
  var results = [];
  
  results.push(folderId);
  results.push(folderName);
  results.push(newFolderName);
  
  return results;
}



function createFolders(folderId, newFolderName, parentId, folderTree) {
  var oldFolder = DriveApp.getFolderById(folderId);
  var folders = oldFolder.getFolders();
  var pair = [];
  var results = [];

  // If the folder doesn't have a parent (top folder only), create a new one with the new folder name
  // otherwise, create a folder within the parent folder using the original folder's name
  if (parentId == "None") {
    var newFolder = DriveApp.createFolder(newFolderName);
  } else {
    var newFolder = DriveApp.getFolderById(parentId).createFolder(newFolderName);
  }
  var newFolderId = newFolder.getId();
  results.push(newFolderId);
  
  var fullPath = getFullPath("", newFolderId);
  
  fullPath = fullPath + newFolderName;
  
  // Loop through children
  while (folders.hasNext()) {
    var child = folders.next();
    var childId = child.getId();
    var childName = child.getName();
    // create child
    createFolders(childId, childName, newFolder.getId(), folderTree);
  }
  
  pair.push(folderId);
  pair.push(newFolderId);
  pair.push(fullPath);
  folderTree.push(pair);
  results.push(folderTree);
  
  return results;
}



// Copies the files (only!) of the passed folderId to the newFolderId
function copyFiles(folderId, newFolderId) {
  var fromFolder = DriveApp.getFolderById(folderId);
  var toFolder = DriveApp.getFolderById(newFolderId);
  var toFolderName = toFolder.getName();
  var files = fromFolder.getFiles();

  while (files.hasNext()) {
   var file = files.next();
   var filename = file.getName();
   file.makeCopy(filename, toFolder);
  } 

  return;
}


function getFullPath(fullPath, folderId) {
  var parents = DriveApp.getFolderById(folderId).getParents();
  var parent = parents.next();
  
  if (parent.getName() != "My Drive") {
    fullPath = parent.getName() + " > " + fullPath;
    
    if (parent.getParents().hasNext()) {
      fullPath = getFullPath(fullPath, parent.getId());
    }
  }
  return fullPath;
}