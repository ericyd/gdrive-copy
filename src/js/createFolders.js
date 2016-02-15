/*
  This function traverses the folder tree and recreates the folder structure
    in the new folder
    
  arguments:
  
     folderId is the ID of the root src folder
     
     newFolderName is a string representing the name of the new (copied) folder
     
     folderTree is an array
        each object is an array with two elements
        first element is original folder Id
        second element is new folder Id, corresponding to original
        third element is the path name for the folder
        
     copyPermissions is a boolean indicating whether or not to copy original sharing permissions 
     
*/

var $ = jQuery = require('jquery');
var copyFiles = require('./copyFiles.js');
var picker = require('./picker');

exports.create = function() {
  
  var selectedFolder = picker.getSelectedFolder();
  var folderId = selectedFolder.id;
  var parentId = selectedFolder.parentId;
  
  var folderTree = [];
  var newFolderName = $("#newFolder").val();
  var copyPermissions = $("#permissions-group input:checked").val() == "yes" ? true : false;
  var dest = $("#destination-group input:checked").val();
  
  return google.script.run
    .withSuccessHandler(function(results) {
        // folder tree is an array
        // each object is an array with two elements
        // first element is original folder Id
        // second element is new folder Id, corresponding to original
        var folderId = results[0];
        var folderTree = results[1];
        var copyPermissions = results[2];
        var added = results[3];
        var statusTable = "";
        
        // Update status for user
        $("#status-title").html("Folders structure copied successfully. Copying files <i class='fa fa-spinner fa-spin'></i>");
        
        // build status-table
        for (i = 0; i < folderTree.length; i++) {
          statusTable += "<tr>";
          statusTable += "<td>" + folderTree[i][2] + "</td>";
          statusTable += "<td id='" + folderTree[i][1] + "'><i>Waiting...</i></td>";
          statusTable += "</tr>";
        }
        $(statusTable).hide().appendTo("#status-table").show('blind');
        // $("#status-table").append(statusTable); 
        
        // When complete, begin copyFiles routine
        copyFiles.copy(folderTree, folderId, copyPermissions, added);
    })
    .withFailureHandler(function(msg) {
      var errormsg = "<div class='alert alert-danger' role='alert'><b>Error:</b> There was an error creating folder structure.<br />";
      errormsg += "<b>Error message:</b> " + msg + ".<br>";
      errormsg += "Please try again. Make sure you have correct permissions to copy this folder, and please input the entire sharing URL, not just the folder ID</div>";
      $("#errors").append(errormsg);
      $("#status-title").html("Error");
    })
    .createFolders(folderId, newFolderName, parentId, folderTree, copyPermissions, [], dest);
}