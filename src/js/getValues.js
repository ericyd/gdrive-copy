/*
   This function retrieves input values from the form and sends them to createFolders
   
   First, it parses the input passed to the folderId input.
   It will parse a pure folder ID, a folder sharing URL, or a folder URL from the browser
   
   Next, it will send the folderId, the boolean copyPermissions, and the newFolderName to createFolders
*/ 

var $ = jQuery = require('jquery');
var createFolders = require('./createFolders');
var picker = require('./picker');

exports.get = function () {
  
  var folderTree = [];
  
  // Get values of folder Ids and pass them to other functions
  return google.script.run
  .withSuccessHandler(function(results) {
    var selectedFolder = picker.getSelectedFolder();
    
    var folderId = selectedFolder.id;
    var folderName = selectedFolder.name;
    var parentId = selectedFolder.parentId;
    
    var newFolderName = results[0];
    var copyPermissions = results[1];
    var dest = results[2];

        
    createFolders.create(folderId, newFolderName, folderTree, copyPermissions, dest, parentId);

  })
  .withFailureHandler(function(msg) {
    // Respond to failure conditions here.
    $("#errors").append("<div class='alert alert-danger' role='alert'><b>Error:</b> There was an error getting the folder information.<br />" + msg + ".<br />Please make sure you are using Google Chrome or Chromium.</div>");
  })
  .getValues( thisForm );
  
  
}

