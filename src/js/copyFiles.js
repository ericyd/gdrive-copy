/* 
   This copies all the files from 
   
   arguments:
   
   folderTree is an array
        each object is an array with two elements
        first element is original folder Id
        second element is new folder Id, corresponding to original
        third element is the path name for the folder
        
    todo: is folderId a necessary argument?    
    folderId is the ID of the root src folder
    
    copyPermissions is a boolean indicating whether or not to copy original sharing permissions
    
    added is an array of email addresses for collaborators with whom the files 
        have already been shared due to parent folder privileges 
*/

var $ = jQuery = require('jquery');
require('../../node_modules/jquery-ui/effect-blind.js');


exports.run = function(folderTree, folderId, copyPermissions, added) {
    return copyFiles(folderTree, folderId, copyPermissions, added);
}

function copyFiles(folderTree, folderId, copyPermissions, added) {
    
    // deconstruct element from folderTree
    var pair = folderTree.shift();
    var fromId = pair[0];
    var toId = pair[1];
    var folderName = pair[2];
    
    
    $("#" + toId).html("Copying files <i class='fa fa-spinner fa-spin'></i>").addClass("disabled");
    
    
    
    google.script.run
      .withSuccessHandler(function() {
        // Respond to success conditions here.
        $("#" + toId).html("Complete").addClass("bg-success").removeClass("disabled");
        
        if (folderTree.length > 0) {
          copyFiles(folderTree, folderId, copyPermissions, added);
        } else {
          $("#status-title").html("Folder copy complete");
          $("#complete").html("Successfully copied folder to your <a href='https://drive.google.com/drive/folders/" + folderId + "' target='_blank'>Google Drive</a>.");
          $("#complete").show("blind");
          $("#please-review").show("blind");
        }
      })
      
      
      
      .withFailureHandler(function(msg) {
        // Respond to failure conditions here.
        
        $("#errors").append("<div class='alert alert-danger' role='alert'><b>Error:</b> There was an error copying files to folder '" + toId + "'.<br /><b>Error message:</b> " + msg + ".</div>");
        
        if (folderTree.length > 0) {
          copyFiles(folderTree);
        } else {
          $("#status-title").html("Folder copy complete");
          $("#complete").html("Successfully copied folder to your <a href='https://drive.google.com/drive/folders/" + folderId + "' target='_blank'>Google Drive</a>.");
          $("#complete").show("blind");
          $("#please-review").show("blind");
          
        }
        
      })
      
      
      
      .copyFiles(fromId, toId, copyPermissions, added);
}