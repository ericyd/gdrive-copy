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
  
  // get properties of selected folder
  var selectedFolder = picker.getSelectedFolder();
  var folderId = selectedFolder.id;
  var parentId = selectedFolder.parentId;
  
  var folderTree = [];
  var newFolderName = $("#newFolder").val();
  var copyPermissions = $("#permissions-group input:checked").val() == "yes" ? true : false;
  var dest = $("#destination-group input:checked").val();
  createFolders.create(folderId, newFolderName, folderTree, copyPermissions, dest, parentId);
  
  
  
}

