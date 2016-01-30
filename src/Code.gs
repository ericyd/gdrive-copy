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
  var permissions = theForm.permissions;
  var results = [];
  
  results.push(folderId);
  results.push(folderName);
  results.push(newFolderName);
  results.push(permissions);
  
  return results;
}



function createFolders(folderId, newFolderName, parentId, folderTree, copyPermissions, added) {
  var oldFolder = DriveApp.getFolderById(folderId);
  var folders = oldFolder.getFolders();
  var pair = [];
  var results = [];
  var newFolder;

  // If the folder doesn't have a parent (top folder only), create a new one with the new folder name
  // otherwise, create a folder within the parent folder using the original folder's name
  if (parentId == "None") {
    newFolder = DriveApp.createFolder(newFolderName);
  } else {
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



// Copies the files (only!) of the passed folderId to the newFolderId
function copyFiles(folderId, newFolderId, copyPermissions, added) {
  var fromFolder = DriveApp.getFolderById(folderId);
  var toFolder = DriveApp.getFolderById(newFolderId);
  var toFolderName = toFolder.getName();
  var files = fromFolder.getFiles();

  while (files.hasNext()) {
    var file = files.next();
    var filename = file.getName();
    var newFile = file.makeCopy(filename, toFolder);
    
    // Copy Permissions if option is selected
    if (copyPermissions) {
      var oldFileEditors = file.getEditors();
      oldFileEditors.push(file.getOwner());
      var oldFileViewers = file.getViewers();
      
      // If file is a Google Doc or Spreadsheet,
      // then use the DocumentApp or SpreadsheetApp to add editors/owners.  
      // This suppresses unnessessary emails
      if (file.getMimeType() == "application/vnd.google-apps.document") {
        var newDoc = DocumentApp.openById(newFile.getId());
        for (i = 0; i < oldFileEditors.length; i++) {
          if (added.indexOf(oldFileEditors[i].getEmail()) == -1) {
            newDoc.addEditor(oldFileEditors[i]);
          }
        }
        for (i = 0; i < oldFileViewers.length; i++) {
          if (added.indexOf(oldFileViewers[i].getEmail()) == -1) {
            newDoc.addViewer(oldFileViewers[i]);
          }
        }
      // Case: Spreadsheet  
      } else if (file.getMimeType() == "application/vnd.google-apps.spreadsheet") {
        var newSheet = SpreadsheetApp.openById(newFile.getId());
        for (i = 0; i < oldFileEditors.length; i++) {
          if (added.indexOf(oldFileEditors[i].getEmail()) == -1) {
            newSheet.addEditor(oldFileEditors[i]);
          }
        }
        for (i = 0; i < oldFileViewers.length; i++) {
          if (added.indexOf(oldFileViewers[i].getEmail()) == -1) {
            newSheet.addViewer(oldFileViewers[i]);
          }
        }
      // Case: All other files
      } else {
        for (i = 0; i < oldFileEditors.length; i++) {
          if (added.indexOf(oldFileEditors[i].getEmail()) == -1) {
            newFile.addEditor(oldFileEditors[i]);
          }
        }
        for (i = 0; i < oldFileViewers.length; i++) {
          if (added.indexOf(oldFileViewers[i].getEmail()) == -1) {
            newFile.addViewer(oldFileViewers[i]);
          }
        }
      }
    }  
  } // while (files.hasNext()) 

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




// Returns token for use with Google Picker
function getOAuthToken() {
    return ScriptApp.getOAuthToken();
}