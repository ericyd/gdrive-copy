<script>
/* 
   This copies all the files
*/

function copyFiles(folderTree, folderId, copyPermissions, added) {
    
    var pair = folderTree.shift();
    var fromId = pair[0];
    var toId = pair[1];
    var folderName = pair[2];
    
    document.getElementById("notes").innerHTML = document.getElementById("notes").innerHTML + '<br />Copying files to "' + folderName + '"...';
    
    google.script.run
      .withSuccessHandler(function() {
        // Respond to success conditions here.
        document.getElementById("notes").innerHTML = document.getElementById("notes").innerHTML + ' <b>Done</b>';
        
        if (folderTree.length > 0) {
          copyFiles(folderTree, folderId, copyPermissions, added);
        } else {
          document.getElementById("notes").innerHTML = document.getElementById("notes").innerHTML + '<br />Folder copy is complete.';
          
          document.getElementById("working").style.display = "none";
          document.getElementById("complete").innerHTML = "Successfully copied folder to your <a href='https://drive.google.com/drive/folders/" + folderId + "' target='_blank'>Google Drive</a>.";
          document.getElementById("complete").style.display = "block";
          document.getElementById("please-review").style.display = "block";
          
        }
      })
      .withFailureHandler(function(msg) {
        // Respond to failure conditions here.
        document.getElementById("notes").innerHTML = document.getElementById("notes").innerHTML + '<br />' + 'failure copying files: ' + msg;
        
        if (folderTree.length > 0) {
          copyFiles(folderTree);
        } else {
          document.getElementById("notes").innerHTML = document.getElementById("notes").innerHTML + '<br />Folder copy is complete.';
          
          document.getElementById("working").style.display = "none";
          document.getElementById("complete").innerHTML = "Successfully copied folder to your <a href='https://drive.google.com/open?id=" + folderId + "'>Google Drive</a>.";
          document.getElementById("complete").style.display = "block";
          document.getElementById("please-review").style.display = "block";
          
        }
        
      })
      .copyFiles(fromId, toId, copyPermissions, added);
}
</script>