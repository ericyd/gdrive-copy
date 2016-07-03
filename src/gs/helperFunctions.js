//noinspection JSUnusedGlobalSymbols
/**
 * Returns token for use with Google Picker
 */
function getOAuthToken() {
    return ScriptApp.getOAuthToken();
}




/**
 * Returns metadata for input file ID
 * 
 * @param {string} id the folder ID for which to return metadata
 * @return {object} the metadata for the folder
 */
function getMetadata(id) {
    return Drive.Files.get(id);
}



/**
 * Returns metadata for input file ID
 * 
 * @param {string} id the folder ID for which to return metadata
 * @return {object} the permissions for the folder
 */
function getPermissions(id) {
    return Drive.Permissions.list(id);
}




/**
 * Gets files from query and returns fileList with metadata
 * 
 * @param {string} query the query to select files from the Drive
 * @param {string} pageToken the pageToken (if any) for the existing query
 * @return {object} fileList object where fileList.items is an array of children files
 */
function getFiles(query, pageToken) {
    var fileList;
    
    fileList = Drive.Files.list({
                    q: query,
                    maxResults: 1000,
                    pageToken: pageToken
                });
        
    return fileList;    
}


/**
 *
 * @param {object} ss instance of Sheet class representing the logger spreadsheet
 * @param {Array} values array of values to be written to the spreadsheet
 */
function log(ss, values) {
    if (ss === null || ss === undefined) {
        ss = SpreadsheetApp.openById(PropertiesService.getUserProperties().getProperties().spreadsheetId).getSheetByName("Log");
    }

    return ss.getRange(ss.getLastRow()+1, 1, 1, values.length).setValues([values]);
}



/**
 * Invokes a function, performing up to 5 retries with exponential backoff.
 * Retries with delays of approximately 1, 2, 4, 8 then 16 seconds for a total of
 * about 32 seconds before it gives up and rethrows the last error.
 * See: https://developers.google.com/google-apps/documents-list/#implementing_exponential_backoff
 * Author: peter.herrmann@gmail.com (Peter Herrmann)
 * @param {Function} func The anonymous or named function to call.
 * @param {string} errorMsg Message to output in case of error
 * @return {*} The value returned by the called function.
 */
function exponentialBackoff(func, errorMsg) {
    for (var n=0; n<6; n++) {
        try {
            return func();
        } catch(e) {
            log(null, [e.message, e.fileName, e.lineNumber]);
            if (n == 5) {
                log(null, [errorMsg, '', '', '', Utilities.formatDate(new Date(), 'GMT-7', "MM-dd-yy hh:mm:ss aaa")]);
                throw e;
            }
            Utilities.sleep((Math.pow(2,n)*1000) + (Math.round(Math.random() * 1000)));
        }
    }
}