/**
 * Delete existing triggers, save properties, and create new trigger
 */
function saveState(makeTrigger) {
    // TODO: don't ever make a trigger
    // TODO: Accept parameter of logMessage {string}

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

    // TODO: Log message passed from other function
}