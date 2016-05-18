// Requires
var picker = require('./picker');


// event bindings
$(function() {

    $(".selectedFolderInfo").hide();
    $("#too-many-triggers").hide();
    $("#resume-form-div").hide();
    $(".description:eq(1)").hide();


    /**
     * Execute when beginning new folder copy
     *
     * Bind form submission action.
     * Disable form elements,
     * Hide description text for app,
     * Show status spinner,
     * run initialization method.
     * 
     * @param {Object} event 
     */
    $("#folderForm").submit(function( event ) {
        
        var errormsg;
        
        // validate
        if (!picker.folder.srcId) {
            errormsg = "<div class='alert alert-danger' role='alert'>Please select a folder</div>";
            $("#errors").html(errormsg);
            
        } else if ( $("#newFolder").val() === "" ) {
            errormsg = "<div class='alert alert-danger' role='alert'>Please enter a new folder name</div>";
            $("#errors").html(errormsg);
            
        } else {
            // Valid!
            onValid();
            
            // Get values from form and selected folder to initialize copy        
            picker.folder.destName = $("#newFolder").val();
            picker.folder.permissions = $("#permissions-group").find("input:checked").val() == "yes";
            picker.folder.destLocation = $("#destination-group").find("input:checked").val();

            // count number of triggers
            google.script.run
                .withSuccessHandler(function(number) {
                    // prompt user to wait or delete existing triggers
                    if (number > 9) {
                        $("#too-many-triggers").show('blind');
                        $("#status").hide("blind");
                    } else {

                        // if not too many triggers, initialize script
                        google.script.run
                            .withSuccessHandler(success)
                            .withFailureHandler(showError)
                            .initialize(picker.folder);
                    }
                })
                .withFailureHandler(function(err) {
                    $("#errors").append(err);
                })
                .getTriggersQuantity();
        }
        event.preventDefault();
    });


    /**
     * Execute when resuming folder copy.
     *
     * @param {Object} event
     */
    $("#resumeForm").submit(function( event ) {

        var errormsg;

        // validate
        if (!picker.folder.srcId) {
            errormsg = "<div class='alert alert-danger' role='alert'>Please select a folder</div>";
            $("#errors").html(errormsg);

        } else {
            // Valid!
            onValid();

            // count number of triggers
            google.script.run
                .withSuccessHandler(function(number) {
                    // prompt user to wait or delete existing triggers
                    if (number > 9) {
                        $("#too-many-triggers").show('blind');
                        $("#status").hide("blind");
                    } else {

                        // if not too many triggers, initialize script
                        google.script.run
                            .withSuccessHandler(success)
                            .withFailureHandler(showError)
                            .resume(picker.folder);
                    }
                })
                .withFailureHandler(function(err) {
                    $("#errors").append(err);
                })
                .getTriggersQuantity();
        }
        event.preventDefault();
    });


    /**
     * Called when either form validates
     */
    function onValid() {
        $(".description").hide("blind");
        $("#errors").html("");
        $(".selectOtherFolder").hide("blind");
        $("#resume-button").hide("blind");
        $("#new-copy-button").hide("blind");

        $("#copyFolderButton").button('loading');
        $("#resumeFolderSubmit").button('loading');
        $("#newFolder").prop('disabled', true);

        $("#status").show("blind");
    }
    
    
    /**
     * Hide 'status' indicator, and show success message.
     * Include links to logger spreadsheet and destination folder
     * so user can monitor progress of the copy.
     * Alert user that they can safely close the window now.
     * 
     * @param {Object} results contains id string for logger spreadsheet and destination folder
     */
    function success(results) {
        
        $("#status").hide("blind");
        
        // link to spreadsheet and  dest Folder
        var copyLogLink = "<a href='https://docs.google.com/spreadsheets/d/" + results.spreadsheetId +"' target='_blank'>copy log</a>";
        $("#copy-log-link").html(copyLogLink);
        
        var destFolderLink = "<a href='https://drive.google.com/drive/u/0/folders/" + results.destId + "' target='_blank'>here</a>";
        $("#dest-folder-link").html(destFolderLink);
        
        // alert that they can close window now
        $("#complete").show("blind");
        $("#please-review").show("blind");
        
        
        
        google.script.run.copy(results.resuming);
        
        
    }
    
    
    
    /**
     * Build an 'alert' div that contains
     * error message output from Google Apps Script
     * and suggestions for fixing the error
     * 
     * @param {string} msg error message produced by Google Apps Script from initialize() call
     */ 
    function showError(msg) {
        
        $("#status").hide("blind");
        
        var errormsg = "<div class='alert alert-danger' role='alert'><b>Error:</b> There was an error initializing the copy folder request.<br />";
        errormsg += "<b>Error message:</b> " + msg + ".<br>";
        errormsg += "Please try again. Make sure you have correct permissions to copy this folder, and make sure you are using Google Chrome or Chromium when using this app.</div>";
        $("#errors").append(errormsg);
        $("#status-title").html("Error");
        
        
    }


    /**
     * Show 'resume' form when #resume-button is selected.
     * Show original form when #new-copy-button is selected.
     */
    $(".toggle-forms").click(function () {
        $("#formDiv").toggle();
        $("#resume-form-div").toggle();
        $(".description").toggle();
        resetForm();
    });


    /**
     * Add explanation tooltip for #explain-permissions
     */
    $("#explain-permissions").tooltip();


    /**
     * Show Google Picker when select Folder buttons are selected
     */
    $(".selectFolderButton").click(function() {
        picker.showPicker();
    });


    
    $('#delete-existing-triggers').click(function() {
        $("#status").show("blind");
        $("#too-many-triggers").hide();
        google.script.run
            .withSuccessHandler(function() {
                google.script.run
                    .withSuccessHandler(success)
                    .withFailureHandler(showError)
                    .initialize(picker.folder);
            })
            .withFailureHandler(function(err) {
                $("#errors").append(err);
            })
            .deleteAllTriggers();
    });
    
    $(".selectOtherFolder").click(function() {
        resetForm();
    });

    function resetForm() {
        $(".getFolderErrors").text("");
        $(".folderSelect").show();
        $(".selectedFolderInfo").hide();
        $("#folderTextbox").val("");
        $("#resumeTextbox").val("");
    }
    

});




/* Handling for folderTextbox: 
   When folder URL is pasted into textbox, it will automatically get the information for the folder.
*/
var folderTextbox = document.getElementById("folderTextbox");
var resumeTextbox = document.getElementById("resumeTextbox");


// Add event listeners
folderTextbox.addEventListener('mouseup', getFileData, false);
folderTextbox.addEventListener('keyup', getFileData, false);
folderTextbox.addEventListener('paste', getFileData, false);

resumeTextbox.addEventListener('mouseup', getFileData, false);
resumeTextbox.addEventListener('keyup', getFileData, false);
resumeTextbox.addEventListener('paste', getFileData, false);




/**
 * If folder URL is added, get folder metadata and display relevant information.
 * 
 * @param {object} e event object
 */
function getFileData(e) {
    if (e.target.value !== "") {
        var id = parseId( e.target.value );
        
        google.script.run
            .withSuccessHandler(function (metadata) {
                // save metadata to picker.folder
                picker.setSelectedFolder({
                    "srcId": metadata.id,
                    "srcParentId": metadata.parents[0].id,
                    "srcName": metadata.title,
                    "destName": "Copy of " + metadata.title
                });

            })
            .withFailureHandler(function (msg) {
                $("#getFolderErrors").text("Error: " + msg);
            })
            .getMetadata(id);
    }
    return false;
    
}




/**
 * Parses folder URL string and returns folder ID string
 * 
 * @param {string} url the folder URL for the selected folder
 * @return {string} id the folder ID for the selected folder
 */
function parseId(url) {
    var id, amp; 
       
    // Get the index of the string at which the folderId starts
    var idStart = url.search("id=");
    var foldersStart = url.search("folders");
    
    if (idStart > 0) {
        id = url.slice(idStart+3);  
    } else if (foldersStart > 0) {
        id = url.slice(foldersStart + 8);  
    }
    
    
    // Find the ampersand in the remaining string, which is the delimiter between the folderId and the sharing privileges
    amp = id.indexOf("&");
    
    // Slice the string up to the ampersand
    if (amp > 0) {
        id = id.slice(0,amp);
    }
    
    return id;
    
}