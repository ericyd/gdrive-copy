// Requires
var picker = require('./picker');
var ui = require('./interactions');
var templates = require('./templates.js');
var formEventListeners = require('./form-event-listeners');
var icons = require('./icons');
var eventListeners = require('./event-listeners');

// event bindings
$(function() {

    eventListeners.addNavListeners();
    eventListeners.addDeleteTriggerButtonListeners();

    $("#put-forms-here").html(templates.start.render({}, icons));
    eventListeners.addStartFormListeners();

    google.script.run
        .withSuccessHandler(function(email) {
            $(".userEmail").html(email);
        })
        .withFailureHandler(function(err) {
            console.log("couldn't get email");
        })
        .getUserEmail();
    
});
