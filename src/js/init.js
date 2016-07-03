// Requires
var picker = require('./picker');
var ui = require('./interactions');
var templates = require('./templates.js');
var textboxHandlers = require('./textbox-handlers');

// event bindings
$(function() {

    $("#put-forms-here").html(templates.new.render({}, {
        'spinner': templates.spinner,
        'question': templates.question
    }));
    textboxHandlers.addNewformListeners();


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
        event.preventDefault();
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
            ui.onValid();
            
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
        
    });


    /**
     * Execute when resuming folder copy.
     *
     * @param {Object} event
     */
    $("#resumeForm").submit(function( event ) {
        event.preventDefault();
        var errormsg;

        // validate
        if (!picker.folder.srcId) {
            errormsg = "<div class='alert alert-danger' role='alert'>Please select a folder</div>";
            $("#errors").html(errormsg);

        } else {
            // Valid!
            ui.onValid();

            picker.folder.resuming = true;

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
        
    });


    
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
        
        
        
        google.script.run.copy();
        
        
    }
    
    
    
    /**
     * Build an 'alert' div that contains
     * error message output from Google Apps Script
     * and suggestions for fixing the error
     * 
     * @param {string} msg error message produced by Google Apps Script from initialize() call
     */ 
    function showError(msg) {
        $("#status").hide();
        
        var errormsg = "<div class='alert alert-danger' role='alert'><b>Error:</b> There was an error initializing the copy folder request.<br />";
        errormsg += "<b>Error message:</b> " + msg + ".<br>";
        errormsg += "Please try again. Make sure you have correct permissions to copy this folder, and make sure you are using Google Chrome or Chromium when using this app.</div>";
        $("#errors").append(errormsg);
    }


    
    $('#delete-existing-triggers').click(function() {
        $("#status").show("blind");
        $("#too-many-triggers").hide();

        google.script.run
            .withSuccessHandler(function() {

                if (picker.folder.resuming) {
                    google.script.run
                        .withSuccessHandler(success)
                        .withFailureHandler(showError)
                        .resume(picker.folder);
                } else {
                    google.script.run
                        .withSuccessHandler(success)
                        .withFailureHandler(showError)
                        .initialize(picker.folder);
                }

            })
            .withFailureHandler(function(err) {
                $("#errors").append(err);
            })
            .deleteAllTriggers();
    });
});
