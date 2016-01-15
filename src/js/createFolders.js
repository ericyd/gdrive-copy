<script>
function createFolders(folderId, newFolderName, folderTree, copyPermissions) {
//function createFolders(folderId, newFolderName, parentId, folderTree) {
  google.script.run
    .withSuccessHandler(function(results) {
        // folder tree is an array
        // each object is an array with two elements
        // first element is original folder Id
        // second element is new folder Id, corresponding to original
        var folderId = results[0];
        var folderTree = results[1];
        var copyPermissions = results[2];
        var added = results[3];
            
        document.getElementById("notes").innerHTML = document.getElementById("notes").innerHTML + '<b>Done</b>';
        document.getElementById("notes").innerHTML = document.getElementById("notes").innerHTML + '<br />' + 'Beginning file copying (this can take a while)';
        
        // build status-table
        statusTable = "<table class='table table-striped'>";
        for (i = 0; i < folderTree.length; i++) {
          statusTable += "<tr>";
          statusTable += "<td>" + folderTree[i][2] + "</td>";
          statusTable += "<td id='" + folderTree[i][1] + "'><span class='waiting'>Waiting...</span></td>";
          statusTable += "</tr>";
          
        }
        statusTable += "</table>";
        document.getElementById("status-table").innerHTML = statusTable; 
        
        copyFiles(folderTree, folderId, copyPermissions, added);
        
  
    })
    .withFailureHandler(function(msg) {
      document.getElementById("notes").innerHTML = document.getElementById("notes").innerHTML + '<br />' + 'failed to create folder: ' + msg;
      document.getElementById("notes").innerHTML = document.getElementById("notes").innerHTML + '<br />' + 'Please try again. Make sure you have correct permissions to copy this folder, and please input the entire sharing URL, not just the folder ID';
      document.getElementById("working").style.display = "none";
    })
    .createFolders(folderId, newFolderName, "None", folderTree, copyPermissions, []);
}
</script>