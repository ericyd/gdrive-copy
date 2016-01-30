var $ = jQuery = require('jquery');

exports.selectedFolder = {};
var pickerApiLoaded = false;
var picker;

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

        picker = new google.picker.PickerBuilder()
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


exports.showPicker = function () {
    return picker.setVisible(true);
}

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
        selectedFolder.id = doc[google.picker.Document.ID];
        selectedFolder.parentId = doc[google.picker.Document.PARENT_ID];
        selectedFolder.name = doc[google.picker.Document.NAME];
        selectedFolder.newName = "Copy of " + selectedFolder.name;
        $("#newFolder").val(selectedFolder.newName);
        $("#folderName").text(selectedFolder.name);
    } else if (action == google.picker.Action.CANCEL) {
        google.script.host.close();
    }
}