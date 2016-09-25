/**
 * This module provides functionality used for the "Select Folder"
 * textboxes, which automatically find folder metadata when a URL 
 * is pasted into them.  The textboxes can handle pasting via 'Ctrl+V',
 * or right-clicking and selecting "Paste" from the context menu. 
 */


// Requires
var picker = require('./picker');
var ui = require('./interactions');
var parseId = require('./parseId');

// interval is the handle for the interval set in handleMouse and cleared in getFileData 
var interval;

// TODO: refactor these functions to live in the 'module.exports' object.

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
        interval = setInterval(g, 500);
        return;
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
                $(".folderSelect").hide();
                $(".folderLookup").hide();
                $(".selectedFolderInfo").show();
                $(".getFolderErrors").text("Error: " + msg + "<br>You may not have permission to copy this folder.").show();
            })
            .getMetadata(id);
    }
    return false;
    
}


module.exports = {
    handleMouse: handleMouse,
    getFileData: getFileData
}