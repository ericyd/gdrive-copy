/**
 * This module provides functionality used for the "Select Folder"
 * textboxes, which automatically find folder metadata when a URL 
 * is pasted into them.  The textboxes can handle pasting via 'Ctrl+V',
 * or right-clicking and selecting "Paste" from the context menu. 
 */

// Requires
var picker = require('./picker');
var DOM = require('./DOM');
var parseId = require('./parseId');

// interval is the handle for the interval set in handleMouse and cleared in getFileData
var interval;

module.exports = {
  /**
     * If right-click, setTimeout
     * If left-click, trigger immediately
     */
  handleMouse: function(e) {
    // if context menu is activated, give user time to paste data via context menu
    if (e.button === 2) {
      var g = function() {
        return module.exports.getFileData(e);
      };
      interval = setInterval(g, 500);
      return;
    }
    module.exports.getFileData(e);
  },

  /**
     * If folder URL is added, get folder metadata and display relevant information.
     * 
     * @param {object} e event object
     */
  getFileData: function(e) {
    if (e.target.value !== '') {
      DOM.onFolderLookup();
      clearInterval(interval);

      var id = parseId(e.target.value);

      google.script.run
        .withSuccessHandler(function(metadata) {
          // save metadata to picker.folder
          picker.setSelectedFolder({
            srcId: metadata.id,
            srcParentId: metadata.parents[0].id,
            srcName: metadata.title,
            destName: 'Copy of ' + metadata.title
          });
        })
        .withFailureHandler(function(msg) {
          $('.folderSelect').hide();
          $('.folderLookup').hide();
          $('.selectedFolderInfo').show();
          $('.getFolderErrors')
            .text(
              'Error: ' +
                msg +
                '<br>You may not have permission to copy this folder.'
            )
            .show();
        })
        .getMetadata(id);
    }
    return false;
  }
};
