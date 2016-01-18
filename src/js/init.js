$(document).ready(function() {
  $("#working").hide();
  $("#notes").hide();
  $("#status").hide();
  $("#complete").hide();
  $("#please-review").hide();
  $("#dialog-message").hide();
  $("#status-table").hide();
  
  
  $("#copyFolderButton").click(function() {
    // Bootstrap button action binding
    var $btn = $(this).button('loading');
    //$btn.button('reset')
    $("#description").hide("blind");
    $("#working").show("blind");
    getValues();
    
  });
  
  // $("#explain-permissions").click(openDialog);
  $("#permissions").click(function() {
    if ($(this).is(":checked")) {
      $('#dialog-message').modal('show');
      // openDialog();
    }
  });
  
  // function openDialog() {
  //   $( "#dialog-message" ).dialog({
  //     modal: true,
  //     buttons: {
  //       Ok: function() {
  //         $( this ).dialog( "close" );
  //       }
  //     }
  //   });
  // }
  

});


