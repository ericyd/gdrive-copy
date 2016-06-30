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


/**
 * Show 'resume' form when #resume-button is selected.
 * Show original form when #new-copy-button is selected.
 */
// $(".toggle-forms").click(function (e) {
//     // #new-copy-folder button is pressed
//     if (e.target.id == document.getElementsByClassName('toggle-forms').item(0).id) {
//         $("#formDiv").show();
//         $("#resume-form-div").hide();
//         $(".description").eq(0).show();
//         $(".description").eq(1).hide();    
//     } 
//     // #resume-copy-folder button is pressed 
//     else {
//         $("#formDiv").hide();
//         $("#resume-form-div").show();
//         $(".description").eq(0).hide();
//         $(".description").eq(1).show();
//     }
// });
 
$('#resume-button').click(function() {
    $("#put-forms-here").html(templates.resume.render({}));
    // $("#put-forms-here").append(templates['gradient-spinner'].render({}));
    // $("#put-forms-here").html(templates.resume.render({}, {
    //     '<spinner0': templates.spinner.render({})
    // }));
    // console.log(templates.resume.partials);
    textboxHandlers.addResumeformListeners();
    $(".description").eq(0).hide();
    $(".description").eq(1).show();  
}); 

    


$('#new-copy-button').click(function() {
    $("#put-forms-here").html(templates.new.render({}));
    textboxHandlers.addNewformListeners();
    $(".description").eq(0).show();
    $(".description").eq(1).hide();
});