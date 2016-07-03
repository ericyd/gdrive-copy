var ui = require('./interactions');
var picker = require('./picker');
var templates = require('./templates.js');
var textboxHandlers = require('./textbox-handlers');

/*
Hide elements that are shown programatically
*/
$("#too-many-triggers").hide();
$("#resume-form-div").hide();
$(".description:eq(1)").hide();



$(".selectOtherFolder").click(function() {
    ui.resetForm();
});

 
$('#resume-button').click(function() {
    $("#put-forms-here").html(templates.resume.render({}, {
        'spinner': templates.spinner
    }));
    textboxHandlers.addResumeformListeners();
    $(".description").eq(0).hide();
    $(".description").eq(1).show();  
}); 

    


$('#new-copy-button').click(function() {
    $("#put-forms-here").html(templates.new.render({}, {
        'spinner': templates.spinner,
        'question': templates.question
    }));
    textboxHandlers.addNewformListeners();
    $(".description").eq(0).show();
    $(".description").eq(1).hide();
});

$('#stop-button').click(function() {
    $("#put-forms-here").html(templates.stop.render({'confirmed': false}));
    $(".description").eq(0).hide();
    $(".description").eq(1).hide();
});

$('#stop-button').click(function() {
    $("#put-forms-here").html(templates.stop.render({'confirmed': false}));
    $(".description").eq(0).hide();
    $(".description").eq(1).hide();

    $('#stop-confirm-button').click(function() {
        $("#put-forms-here").html(templates.stop.render({'confirmed': true}));
    });
});