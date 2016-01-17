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
        
        // Update status for user
        $("#working").html("Folders structure copied successfully.<br />Copying files...");
        
        // build status-table
        statusTable = "<table class='table table-striped'>";
        statusTable += "<tr><th>Folder path</th><th>Status</th></tr>";
        for (i = 0; i < folderTree.length; i++) {
          statusTable += "<tr>";
          statusTable += "<td>" + folderTree[i][2] + "</td>";
          statusTable += "<td id='" + folderTree[i][1] + "'><i>Waiting...</i></td>";
          statusTable += "</tr>";
        }
        statusTable += "</table>";
        $("#status-table").html(statusTable).show("blind"); 
        
        // When complete, being copyFiles routine
        copyFiles(folderTree, folderId, copyPermissions, added);
    })
    .withFailureHandler(function(msg) {
      var errormsg = "<div class='alert alert-danger' role='alert'><b>Error:</b> There was an error creating folder structure.<br />";
      errormsg += "<b>Error message:</b> " + msg + ".<br>";
      errormsg += "Please try again. Make sure you have correct permissions to copy this folder, and please input the entire sharing URL, not just the folder ID</div>";
      $("#errors").append(errormsg);
      $("#working").hide("blind");
    })
    .createFolders(folderId, newFolderName, "None", folderTree, copyPermissions, []);
}