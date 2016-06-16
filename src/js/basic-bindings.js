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
$(".toggle-forms").click(function (e) {
    // #new-copy-folder button is pressed
    if (e.target.id == document.getElementsByClassName('toggle-forms').item(0).id) {
        $("#formDiv").show();
        $("#resume-form-div").hide();
        $(".description").eq(0).show();
        $(".description").eq(1).hide();    
    }
    // #resume-copy-folder button is pressed 
    else {
        $("#formDiv").hide();
        $("#resume-form-div").show();
        $(".description").eq(0).hide();
        $(".description").eq(1).show();
    }
});




/**
 * Show Google Picker when select Folder buttons are selected
 */
$(".selectFolderButton").click(function() {
    picker.showPicker();
});