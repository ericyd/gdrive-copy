<script>
// Global variables
var folderTree = [];
   
/*
   This function gets the folderId from the sharing URL given from Google Drive
   It passes that ID to the getFolders
*/

document.getElementById("copyFolderButton").onclick = function() {
       
       // Declare Variables
       
       // Regular expression - find string beginning with "id="
       // http://www.w3schools.com/jsref/jsref_regexp_source.asp
       var regex = /id=/; 
       
       // Set a temporary variable to the value passed into the "folderId" field
       var fId = thisForm.folderId.value;
       
       // Get the index of the string at which the folderId starts
       var idStart = fId.search(regex);
       var foldersStart = fId.search("folders");
       if (idStart > 0) {
         // Slice the string starting 3 indices after "id=", which means that it takes away "id=" and leaves the rest
         fId = fId.slice(idStart+3);  
       } else if (foldersStart > 0) {
         fId = fId.slice(foldersStart + 8);  
       }
       
       
       // Find the ampersand in the remaining string, which is the delimiter between the folderId and the sharing privileges
       var amp = fId.indexOf("&");
       
       // Slice the string up to the ampersand
       if (amp > 0) {
         fId = fId.slice(0,amp);
       }
       
       // Set the folderId element within thisForm (retrieved from doGet) to the new, sliced fId variable
       thisForm.folderId.value = fId;
       
       // Pop up the "working" div
       
       
       
     
       // Get values of folder Ids and pass them to other functions
       google.script.run
       .withSuccessHandler(function(results) {
         
         var folderId = results[0];
         var folderName = results[1];
         var newFolderName = results[2];
         var copyPermissions = results[3];
             
         document.getElementById("notes").innerHTML = document.getElementById("notes").innerHTML + '<br />Initializing copy from "' + folderName + '" to "' + newFolderName + '".';
         document.getElementById("notes").innerHTML = document.getElementById("notes").innerHTML + '<br />Recreating folder structure ... ';
             
         //getFolders(folderId, folderTree, newFolderName);
         createFolders(folderId, newFolderName, folderTree, copyPermissions);
             
         //copyFiles(results[0], results[1]);
       })
       .withFailureHandler(function(msg) {
         // Respond to failure conditions here.
         document.getElementById("notes").innerHTML = document.getElementById("notes").innerHTML + '<br />' + 'failure<br />' + msg;
       })
       .getValues( thisForm );
}
</script>