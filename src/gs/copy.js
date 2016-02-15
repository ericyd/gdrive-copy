// This is an initialization function to get values from the form and pass them to other functions

// todo: since this no longer queries DriveApp (thanks to Picker), I could move this to client-side js and save some time
function getValues(theForm) {
  // get values from form
  var newFolderName = theForm.newFolder;
  var permissions;
  if (theForm.permissions == "yes") {
    permissions = true;
  } else {
    permissions = false;
  }
  var dest = theForm.copyLocationOptions;
  var results = [];
  
  results.push(newFolderName);
  results.push(permissions);
  results.push(dest);
  
  return results;
}



/**
 * Copies files from a single source folder to a single
 * destination folder.  Optionally copies sharing permissions
 * associated with original file
 *
 * @param {string} folderId identifier of source folder
 * @param {string} newFolderId identifier of destination folder
 * @param {boolean} copyPermissions copy permissions associated with source 
 *    folder files to destination folder files
 * @param {array} added list of email addresses already added to parent
 *    folders and thus do not need to be duplicated, thus reducing number
 *    of emails sent 
 */
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







