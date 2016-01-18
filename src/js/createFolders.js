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
        $("#status-table").append(statusTable); 
        
        // When complete, begin copyFiles routine
        copyFiles(folderTree, folderId, copyPermissions, added);
    })
    .withFailureHandler(function(msg) {
      var errormsg = "<div class='alert alert-danger' role='alert'><b>Error:</b> There was an error creating folder structure.<br />";
      errormsg += "<b>Error message:</b> " + msg + ".<br>";
      errormsg += "Please try again. Make sure you have correct permissions to copy this folder, and please input the entire sharing URL, not just the folder ID</div>";
      $("#errors").append(errormsg);
      $("#status-title").html("Error");
    })
    .createFolders(folderId, newFolderName, "None", folderTree, copyPermissions, []);
}