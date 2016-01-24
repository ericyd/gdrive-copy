/*
  This function contains initialization code and event bindings for page elements
*/

var $ = jQuery = require('jquery');
require('../../node_modules/bootstrap-sass/assets/javascripts/bootstrap/button.js');
require('../../node_modules/bootstrap-sass/assets/javascripts/bootstrap/modal.js');
require('../../node_modules/jquery-ui/effect-blind.js');
var getValues = require('./getValues');


$(document).ready(function() {
  $("#status").hide();
  $("#complete").hide();
  $("#please-review").hide();
  $("#dialog-message").hide();
});


$("#thisForm").submit(function( event ) {
  // Bootstrap button action binding
  var $btn = $("#copyFolderButton").button('loading');
  //$btn.button('reset') // call to reset to original condition
  $("#description").hide("blind");
  $("#status").show("blind");
  getValues.run();
  event.preventDefault();
});

$("#permissions").click(function() {
  if ($(this).is(":checked")) {
    $('#dialog-message').modal('show');
  }
});