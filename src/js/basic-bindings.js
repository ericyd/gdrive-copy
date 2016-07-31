var ui = require('./interactions');
var picker = require('./picker');
var templates = require('./templates.js');
var textboxHandlers = require('./textbox-handlers');
var icons = require('./icons');

/*
Hide elements that are shown programatically
*/
$("#too-many-triggers").hide();




$(".selectOtherFolder").click(function() {
    ui.resetForm();
});




$('#resume-button').click(function() {
    $("#put-forms-here").html(templates.resume.render({}, icons));
    textboxHandlers.addResumeformListeners();
}); 

    


$('#new-copy-button').click(function() {
    $("#put-forms-here").html(templates.start.render({}, icons));
    textboxHandlers.addNewformListeners();
});




$('#stop-button').click(function() {
    $("#put-forms-here").html(templates.pause.render({'confirmed': false}));

    $('#stop-confirm-button').click(function() {
        $("#put-forms-here").html(templates.pause.render({'confirmed': true}));
    });
});