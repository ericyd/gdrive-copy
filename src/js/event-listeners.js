/**
 * This module provides functions that add event listeners
 * to all parts of the application.
 * 
 * Individual functions are commented to provide context for 
 * their usage.
 */

var ui = require('./interactions');
var picker = require('./picker');
var templates = require('./templates.js');
var formEventListeners = require('./form-event-listeners');
var icons = require('./icons');


module.exports = {
    /**
     * Sets bindings for navigation buttons
     */
    'addNavListeners': function() {
        
        $('#resume-button').click(function() {
            $("#put-forms-here").html(templates.resume.render({}, icons));
            $(".btn--nav").removeClass("active");
            $(this).addClass("active");
            // TODO: refactor into this module
            formEventListeners.addResumeformListeners();
        }); 

        $('#start-button').click(function(e) {
            $("#put-forms-here").html(templates.start.render({}, icons));
            $(".btn--nav").removeClass("active");
            $(this).addClass("active");
            // TODO: refactor into this module
            formEventListeners.addNewformListeners();
        });

        $('#stop-button').click(function(e) {
            $("#put-forms-here").html(templates.pause.render({'confirmed': false}));
            $(".btn--nav").removeClass("active");
            $(this).addClass("active");

            $('#stop-confirm-button').click(function() {
                $("#put-forms-here").html(templates.pause.render({'confirmed': true}));
                google.script.run.setStopFlag();
            });
        });

        $('#faq-button').click(function() {
            $("#put-forms-here").html(templates.faq.render({}, icons));
            $(".btn--nav").removeClass("active");
            $(this).addClass("active");
        });
    },



    /**
     * Set bindings for selectFolder and selectOtherFolder buttons.
     * Used in both addResumeformListeners and addStartFormListeners
     */
    'addSelectButtonListeners': function() {
        $(".selectOtherFolder").click(function() {
            ui.resetForm();
        });

        // Show Google Picker when select Folder buttons are selected
        $(".selectFolderButton").click(function() {
            picker.showPicker();
        });
    },



    /**
     * Set bindings for input elements in the Resume view
     */
    'addResumeFormListeners': function() {

    },



    /**
     * set bindings for input elements in the Start view
     */
    'addStartFormListeners': function() {
        
    }


}