/*
   This function gets the folderId from the sharing URL given from Google Drive
   It passes that ID to the getFolders
*/ 

var $ = jQuery = require('jquery');


function getValues() {
  
  var folderTree = [];
 
  // Set a temporary variable to the value passed into the "folderId" field
  var fId = thisForm.folderId.value;
  
  // Get the index of the string at which the folderId starts
  var idStart = fId.search("id=");
  var foldersStart = fId.search("folders");
  if (idStart > 0) {
    // Slice the string starting 3 indices after "id=", which means that it takes away "id=" and leaves the rest
    fId = fId.slice(idStart+3);  
  } else if (foldersStart > 0) {
    fId = fId.slice(foldersStart + 8);  
  }
  
  
  // Find the ampersand in the remaining string, which is the delimiter between the folderId and the sharing privileges
  var amp = fId.indexOf("&");
  
  // Slice the string up to the ampersand
  if (amp > 0) {
    fId = fId.slice(0,amp);
  }
  
  // Set the folderId element within thisForm (retrieved from doGet) to the new, sliced fId variable
  thisForm.folderId.value = fId;
  
  
  
  // Get values of folder Ids and pass them to other functions
  google.script.run
  .withSuccessHandler(function(results) {
    
    var folderId = results[0];
    var folderName = results[1];
    var newFolderName = results[2];
    var copyPermissions = results[3];
        
    createFolders(folderId, newFolderName, folderTree, copyPermissions);

  })
  .withFailureHandler(function(msg) {
    // Respond to failure conditions here.
    $("#errors").append("<div class='alert alert-danger' role='alert'><b>Error:</b> There was an error getting the folder information.<br />" + msg + ".<br />Please make sure you are using Google Chrome or Chromium.</div>");
  })
  .getValues( thisForm );
}