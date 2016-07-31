// Requires
var picker = require('./picker');
var ui = require('./interactions');
var parseId = require('./parseId');

// interval is the handle for the interval set in handleMouse and cleared in getFileData 
var interval;



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


module.exports = {
    handleMouse: handleMouse,
    getFileData: getFileData
}