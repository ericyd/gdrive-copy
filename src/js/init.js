var $ = jQuery = require('jquery');
require('../../node_modules/bootstrap-sass/assets/javascripts/bootstrap/button.js');
require('../../node_modules/bootstrap-sass/assets/javascripts/bootstrap/modal.js');
require('../../node_modules/jquery-ui/effect-blind.js');
// require('./getValues.js');

$(document).ready(function() {
  // $("#working").hide();
  // $("#notes").hide();
  $("#status").hide();
  $("#complete").hide();
  $("#please-review").hide();
  $("#dialog-message").hide();
  // $("#status-table").hide();
  
  
  $("#copyFolderButton").click(function() {
    // Bootstrap button action binding
    var $btn = $(this).button('loading');
    //$btn.button('reset')
    $("#description").hide("blind");
    $("#status").show("blind");
    getValues();
    
  });
  
  $("#permissions").click(function() {
    if ($(this).is(":checked")) {
      $('#dialog-message').modal('show');
    }
  });

});


