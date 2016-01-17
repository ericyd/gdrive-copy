/* 
   This copies all the files
*/

function copyFiles(folderTree, folderId, copyPermissions, added) {
    
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
          $("#working").hide("blind");
          document.getElementById("complete").innerHTML = "Successfully copied folder to your <a href='https://drive.google.com/drive/folders/" + folderId + "' target='_blank'>Google Drive</a>.";
          document.getElementById("complete").style.display = "block";
          document.getElementById("please-review").style.display = "block";
          
        }
      })
      .withFailureHandler(function(msg) {
        // Respond to failure conditions here.
        
        $("#errors").append("<div class='alert alert-danger' role='alert'><b>Error:</b> There was an error copying files to folder '" + toId + "'.<br /><b>Error message:</b> " + msg + ".</div>");
        
        if (folderTree.length > 0) {
          copyFiles(folderTree);
        } else {
          $("#working").hide("blind");
          document.getElementById("complete").innerHTML = "Successfully copied folder to your <a href='https://drive.google.com/drive/folders/" + folderId + "' target='_blank'>Google Drive</a>.";
          document.getElementById("complete").style.display = "block";
          document.getElementById("please-review").style.display = "block";
          
        }
        
      })
      .copyFiles(fromId, toId, copyPermissions, added);
}