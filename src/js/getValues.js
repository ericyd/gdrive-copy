/*
   This function retrieves input values from the form and sends them to createFolders
   
   First, it parses the input passed to the folderId input.
   It will parse a pure folder ID, a folder sharing URL, or a folder URL from the browser
   
   Next, it will send the folderId, the boolean copyPermissions, and the newFolderName to createFolders
*/ 

var $ = jQuery = require('jquery');
var createFolders = require('./createFolders.js');

exports.run = function (selectedFolder) {
  
  var folderTree = [];
  
  // Get values of folder Ids and pass them to other functions
  return google.script.run
  .withSuccessHandler(function(results) {
    
    var folderId = results[0];
    var folderName = results[1];
    var newFolderName = results[2];
    var copyPermissions = results[3];
    var dest = results[4];
    var parentId = results[5];
        
    createFolders.run(folderId, newFolderName, folderTree, copyPermissions, dest, parentId);

  })
  .withFailureHandler(function(msg) {
    // Respond to failure conditions here.
    $("#errors").append("<div class='alert alert-danger' role='alert'><b>Error:</b> There was an error getting the folder information.<br />" + msg + ".<br />Please make sure you are using Google Chrome or Chromium.</div>");
  })
  .getValues( thisForm, selectedFolder );
  
  
}

