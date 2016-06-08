/*
This handles all of the hiding/showing of UI elements
for various user inputs

Primarily refactored out of init.js and picker.js
*/


module.exports = {
    /**
    * Updates "Select Folder" fields with selected folder info
    */
    folderIsSelected: function (selectedFolder) {
        // update display
        $(".getFolderErrors").text("");
        $("#newFolder").val(selectedFolder.destName);
        $(".folderName").text(selectedFolder.srcName);
        
        $(".folderSelect").hide();
        $(".folderLookup").hide();
        $(".selectedFolderInfo").show();
    },
    
    
    /**
    * Function to alert user that folder is being identified
    * Hides folder
    */
    onFolderLookup: function () {
        $(".folderLookup").show();
        $(".folderSelect").hide();
    }, 
    
    
    
    
    /**
    * Called when either form validates.
    * Updates UI to indicate that the app is initializing.
    */
    onValid: function () {
        $(".description").hide("blind");
        $("#errors").html("");
        $(".selectOtherFolder").hide("blind");
        $("#resume-button").attr("disabled", "disabled");
        $("#new-copy-button").attr("disabled", "disabled");
        
        $("#copyFolderButton").button('loading');
        $("#resumeFolderSubmit").button('loading');
        $("#newFolder").prop('disabled', true);
        
        $("#status").show("blind");
    },
    
    
    
    /**
    * Resets form to default state
    */
    resetForm: function () {
        $(".getFolderErrors").text("");
        $(".folderSelect").show();
        $(".selectedFolderInfo").hide();
        $("#folderTextbox").val("");
        $("#resumeTextbox").val("");
    }
}

