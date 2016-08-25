/**
 * Delete existing triggers, save properties, and create new trigger
 */
function saveState(makeTrigger) {
    try {
        // save, create trigger, and assign pageToken for continuation
        properties.leftovers = files && files.items ? files : properties.leftovers;
        properties.pageToken = properties.leftovers.nextPageToken;
    } catch (err) {
        log(ss, [err.message, err.fileName, err.lineNumber]);
    }

    try {
        saveProperties(properties);
        if (makeTrigger !== 'notrigger') {
            exponentialBackoff(createTrigger,
                'Error setting trigger.  There has been a server error with Google Apps Script.' +
                'To successfully finish copying, please Copy Folder.');
        }
        
    } catch (err) {
        log(ss, [err.message, err.fileName, err.lineNumber]);
    }
}