// Requires
var picker = require('./picker');
var ui = require('./interactions');

// interval is the handle for the interval set in handleMouse and cleared in getFileData 
var interval;

/* Handling for folderTextbox: 
   When folder URL is pasted into textbox, it will automatically get the information for the folder.
*/
var folderTextbox = document.getElementById("folderTextbox");
var resumeTextbox = document.getElementById("resumeTextbox");


// Add event listeners
folderTextbox.addEventListener('mouseup', handleMouse, false);
folderTextbox.addEventListener('keyup', getFileData, false);
resumeTextbox.addEventListener('mouseup', handleMouse, false);
resumeTextbox.addEventListener('keyup', getFileData, false);



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




/**
 * Parses folder URL string and returns folder ID string
 * 
 * @param {string} url the folder URL for the selected folder
 * @return {string} id the folder ID for the selected folder
 */
function parseId(url) {
    var id, amp; 
       
    // Get the index of the string at which the folderId starts
    var idStart = url.search("id=");
    var foldersStart = url.search("folders");
    
    if (idStart > 0) {
        id = url.slice(idStart+3);  
    } else if (foldersStart > 0) {
        id = url.slice(foldersStart + 8);  
    }
    
    
    // Find the ampersand in the remaining string, which is the delimiter between the folderId and the sharing privileges
    amp = id.indexOf("&");
    
    // Slice the string up to the ampersand
    if (amp > 0) {
        id = id.slice(0,amp);
    }
    
    return id;
    
}