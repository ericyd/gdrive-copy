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

    google.script.run
        .withSuccessHandler(function(email) {
            $(".userEmail").html(email);
        })
        .withFailureHandler(function(err) {
            console.log("couldn't get email");
        })
        .getUserEmail();
    

    
    $('#delete-existing-triggers').click(function() {
        $("#status").show("blind");
        $("#too-many-triggers").hide();

        google.script.run
            .withSuccessHandler(function() {

                if (picker.folder.resuming) {
                    google.script.run
                        .withSuccessHandler(formEventListeners.success)
                        .withFailureHandler(formEventListeners.showError)
                        .resume(picker.folder);
                } else {
                    google.script.run
                        .withSuccessHandler(formEventListeners.success)
                        .withFailureHandler(formEventListeners.showError)
                        .initialize(picker.folder);
                }

            })
            .withFailureHandler(function(err) {
                $("#errors").append(err);
            })
            .deleteAllTriggers();
    });
});
