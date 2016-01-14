<script src="//ajax.googleapis.com/ajax/libs/jquery/1.9.1/jquery.min.js"></script>

<script src="https://ajax.googleapis.com/ajax/libs/jqueryui/1.11.4/jquery-ui.min.js"></script>

<script>


$(document).ready(function() {
  $("#working").hide();
  $("#notes").hide();
  $("#status").hide();
  $("#complete").hide();
  $("#please-review").hide();
  $("#dialog-message").hide();
  

  $("#copyFolderButton").click(function() {
    $("#description").hide("blind");
    $("#working").show("blind");
    $("#notes").show("blind");
    $("#status").show("blind");
  });
  
  $("#explain-permissions").click(openDialog);
  $("#permissions").click(function() {
    if ($(this).is(":checked")) {
      openDialog();
    }
  });
  
  function openDialog() {
    $( "#dialog-message" ).dialog({
      modal: true,
      buttons: {
        Ok: function() {
          $( this ).dialog( "close" );
        }
      }
    });
  }

});



</script>




