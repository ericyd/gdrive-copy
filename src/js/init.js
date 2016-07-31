// Requires
var picker = require('./picker');
var ui = require('./interactions');
var templates = require('./templates.js');
var formEventListeners = require('./form-event-listeners');
var icons = require('./icons');

// event bindings
$(function() {

    $("#put-forms-here").html(templates.start.render({}, icons));
    formEventListeners.addNewformListeners();

    
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
