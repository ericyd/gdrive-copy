// Requires
var picker = require('./picker');
var templates = require('./templates.js');
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
