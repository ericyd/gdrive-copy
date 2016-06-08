var ui = require('./interactions');
var picker = require('./picker');

/*
Hide elements that are shown programatically
*/
$(".selectedFolderInfo").hide();
$("#too-many-triggers").hide();
$("#resume-form-div").hide();
$(".description:eq(1)").hide();
$(".folderLookup").hide();



$(".selectOtherFolder").click(function() {
    ui.resetForm();
});


/**
 * Show 'resume' form when #resume-button is selected.
 * Show original form when #new-copy-button is selected.
 */
$(".toggle-forms").click(function () {
    $("#formDiv").toggle();
    $("#resume-form-div").toggle();
    $(".description").toggle();
});




/**
 * Show Google Picker when select Folder buttons are selected
 */
$(".selectFolderButton").click(function() {
    picker.showPicker();
});