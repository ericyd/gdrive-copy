var ui = require('./interactions');
var picker = require('./picker');
var templates = require('./templates.js');
var formEventListeners = require('./form-event-listeners');
var icons = require('./icons');



$(".selectOtherFolder").click(function() {
    ui.resetForm();
});




$('#resume-button').click(function() {
    $("#put-forms-here").html(templates.resume.render({}, icons));
    $(".btn--nav").removeClass("active");
    $(this).addClass("active");
    formEventListeners.addResumeformListeners();
}); 

    


$('#start-button').click(function(e) {
    $("#put-forms-here").html(templates.start.render({}, icons));
    $(".btn--nav").removeClass("active");
    $(this).addClass("active");
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