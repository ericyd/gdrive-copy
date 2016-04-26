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
    if (ss) {
        return ss.getRange(ss.getLastRow()+1, 1, 1, values.length).setValues([values]);
    } else {
        var userProperties = PropertiesService.getUserProperties().getProperties();
        return SpreadsheetApp.openById(userProperties.spreadsheetId).getSheetByName("Log")
            .getRange(ss.getLastRow()+1, 1, 1, values.length).setValues([values]);
    }
}