// Requires
var picker = require('./picker');
var ui = require('./interactions');
var parseId = require('./parseId');

// interval is the handle for the interval set in handleMouse and cleared in getFileData 
var interval;




/* Handling for folderTextbox: 
   When folder URL is pasted into textbox, it will automatically get the information for the folder.
*/

// Add event listeners
function addNewformListeners() {
    var folderTextbox = document.getElementById("folderTextbox");
    folderTextbox.addEventListener('mouseup', handleMouse, false);
    folderTextbox.addEventListener('keyup', getFileData, false);
    $(".selectOtherFolder").click(function() {
        ui.resetForm();
    });

    /**
     * Show Google Picker when select Folder buttons are selected
     */
    $(".selectFolderButton").click(function() {
        picker.showPicker();
    });
    
}

function addResumeformListeners() {
    var resumeTextbox = document.getElementById("resumeTextbox");
    resumeTextbox.addEventListener('mouseup', handleMouse, false);
    resumeTextbox.addEventListener('keyup', getFileData, false);
    $(".selectOtherFolder").click(function() {
        ui.resetForm();
    });

    /**
     * Show Google Picker when select Folder buttons are selected
     */
    $(".selectFolderButton").click(function() {
        picker.showPicker();
    });
}

exports.addNewformListeners = addNewformListeners;
exports.addResumeformListeners = addResumeformListeners;  



/**
 * If right-click, setTimeout
 * If left-click, trigger immediately
 */
function handleMouse(e) {
    // if context menu is activated, give user time to paste data via context menu
    if (e.button === 2) {
        var g = function () {
            return getFileData(e);
        }; 
        return interval = setInterval(g, 500);
    }
    getFileData(e);
}



/**
 * If folder URL is added, get folder metadata and display relevant information.
 * 
 * @param {object} e event object
 */
function getFileData(e) {
    
    if (e.target.value !== "") {
        ui.onFolderLookup();
        clearInterval(interval);
        
        var id = parseId( e.target.value );
        
        google.script.run 
            .withSuccessHandler(function (metadata) {
                // save metadata to picker.folder
                picker.setSelectedFolder({
                    "srcId": metadata.id,
                    "srcParentId": metadata.parents[0].id,
                    "srcName": metadata.title,
                    "destName": "Copy of " + metadata.title
                });

            })
            .withFailureHandler(function (msg) {
                $("#getFolderErrors").text("Error: " + msg);
            })
            .getMetadata(id);
    }
    return false;
    
}