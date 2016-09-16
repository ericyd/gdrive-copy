/**
 * save srcId, destId, copyPermissions, spreadsheetId to userProperties.
 * 
 * This is used when resuming, in which case the IDs of the logger spreadsheet and 
 * properties document will not be known.
 */
function setUserPropertiesStore(spreadsheetId, propertiesDocId, destId, resuming) {
    var userProperties = PropertiesService.getUserProperties();
    userProperties.setProperty("destId", destId);
    userProperties.setProperty("spreadsheetId", spreadsheetId);
    userProperties.setProperty("propertiesDocId", propertiesDocId);
    userProperties.setProperty("trials", 0);
    userProperties.setProperty("resuming", resuming);
    userProperties.setProperty('stop', 'false');
} 