/*
Many, many thanks to [Jean-Pierre Verhulst](https://plus.google.com/+JeanPierreVerhulst/posts) 
for providing the working backbone of this script
*/




// requires
var $ = jQuery = require('jquery');


/* Load api script.  On success, run onApiLoad()

    this is an alternative to including this script tag after the js
    <script type="text/javascript" src="https://apis.google.com/js/api.js?onload=onApiLoad"></script>
    Note: above method fails when js is bundled using browserify
*/
// jQuery.getScript( "https://apis.google.com/js/api.js", onApiLoad );


// vanillaJS implementation of $.getScript(), thanks to http://stackoverflow.com/questions/16839698/jquery-getscript-alternative-in-native-javascript
function getScript(source, callback) {
    var script = document.createElement('script');
    var prior = document.getElementsByTagName('script')[0];
    script.async = 1;
    prior.parentNode.insertBefore(script, prior);

    script.onload = script.onreadystatechange = function( _, isAbort ) {
        if(isAbort || !script.readyState || /loaded|complete/.test(script.readyState) ) {
            script.onload = script.onreadystatechange = null;
            script = undefined;

            if(!isAbort) { if(callback) callback(); }
        }
    };

    script.src = source;
}


getScript("https://apis.google.com/js/api.js", onApiLoad);






// Declare variables
var selectedFolder = {};
var pickerApiLoaded = false;
var pickerBuilder;


exports.folder = selectedFolder;



function onApiLoad() {
    gapi.load('picker', {
        'callback': function() {
            pickerApiLoaded = true;
        }
    });
    google.script.run.withSuccessHandler(createPicker)
        .withFailureHandler(showError).getOAuthToken();
}



function createPicker(token) {

    if (pickerApiLoaded && token) {
        var foldersView = new google.picker.DocsView()
            .setIncludeFolders(true)
            .setMimeTypes('application/vnd.google-apps.folder')
            .setSelectFolderEnabled(true);

        pickerBuilder = new google.picker.PickerBuilder()
            .addView(foldersView)
            .hideTitleBar()
            .setOAuthToken(token)
            .setMaxItems(1)
            .setCallback(pickerCallback)
            .setTitle("Select a folder to copy")
            .setOrigin('https://script.google.com')
            .build();

    } else {
        // todo: handle errors
        
    }
}


// Allows method binding from external scripts, e.g. init.js
exports.showPicker = function() {
    return pickerBuilder.setVisible(true);
};



/**
 * A callback function that extracts the chosen document's metadata from the
 * response object. For details on the response object, see
 * https://developers.google.com/picker/docs/result
 *
 * @param {object} data The response object.
 */
    
function pickerCallback(data) {
    var action = data[google.picker.Response.ACTION];
    
    if (action == google.picker.Action.PICKED) {
        var doc = data[google.picker.Response.DOCUMENTS][0];
        setSelectedFolder({
            "srcId": doc[google.picker.Document.ID],
            "srcParentId": doc[google.picker.Document.PARENT_ID],
            "srcName": doc[google.picker.Document.NAME],
            "destName": "Copy of " + doc[google.picker.Document.NAME]
        });
        
    } else if (action == google.picker.Action.CANCEL) {
        google.script.host.close();
    }
}



/**
 * save passed values to selectedFolder
 * 
 * @param {object} properties selectedFolder properties to save
 */
function setSelectedFolder(properties) {
    // save properties
    selectedFolder.srcId = properties.srcId;
    selectedFolder.srcParentId = properties.srcParentId;
    selectedFolder.srcName = properties.srcName;
    selectedFolder.destName = properties.destName;
    
    // update display
    $("#getFolderErrors").text("");
    $("#newFolder").val(selectedFolder.destName);
    $(".folderName").text(selectedFolder.srcName);
    
    $("#folderSelect").hide();
    $("#selectedFolderInfo").show();
    
}

exports.setSelectedFolder = setSelectedFolder;

function showError() {
    $("#getFolderErrors").text("Error getting OAuth token for Google Picker.  Please manually input folder URL");
}