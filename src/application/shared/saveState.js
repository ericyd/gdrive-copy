/**
 * Delete existing triggers, save properties, and create new trigger
 * 
 * @param {string} logMessage - The message to output to the log when state is saved
 */
function saveState(fileList, logMessage, ss) {

    try {
        // save, create trigger, and assign pageToken for continuation
        properties.leftovers = fileList && fileList.items ? fileList : properties.leftovers;
        properties.pageToken = properties.leftovers.nextPageToken;
    } catch (err) {
        log(ss, [err.message, err.fileName, err.lineNumber]);
    }

    try {
        saveProperties(properties);
        
    } catch (err) {
        log(ss, [err.message, err.fileName, err.lineNumber]);
    }

    log(ss, [logMessage]);
}