// Requires
var $ = jQuery = require('jquery');
require('../../node_modules/bootstrap-sass/assets/javascripts/bootstrap/button.js');
require('../../node_modules/bootstrap-sass/assets/javascripts/bootstrap/modal.js');
require('../../node_modules/jquery-ui/effect-blind.js');
var picker = require('./picker');
var createFolders = require('./createFolders');


// event bindings
$(function() {
  
  // Form submission
  $("#thisForm").submit(function( event ) {
    // Bootstrap button action binding
    var $btn = $("#copyFolderButton").button('loading');
    $("#description").hide("blind");
    $("#status").show("blind");
    createFolders.create();
    event.preventDefault();
  });
  
  
  
  // Display modal when question mark is selected
  $("#permissions").click(function() {
    if ($(this).is(":checked")) {
      $('#dialog-message').modal('show');
    }
  });
  
  
  
  // Bind showPicker()
  $("#selectFolderButton").click(function() {
    picker.showPicker();
  })


});