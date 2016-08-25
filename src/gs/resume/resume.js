/**
 * Created by eric on 5/18/16.
 */
/**
 * Find prior copy folder instance.
 * Find propertiesDoc and logger spreadsheet, and save IDs to userProperties, which will be used by loadProperties.
 *
 * @param selectedFolder object containing information on folder selected in app
 * @returns {{spreadsheetId: string, destId: string, resuming: boolean}}
 */

function resume(selectedFolder) {

    var priorCopy = findPriorCopy(selectedFolder.srcId);

    PropertiesService.getUserProperties().setProperty("destId", selectedFolder.destId);
    PropertiesService.getUserProperties().setProperty("resuming", 'true');
    PropertiesService.getUserProperties().setProperty("spreadsheetId", priorCopy.spreadsheetId);
    PropertiesService.getUserProperties().setProperty("propertiesDocId", priorCopy.propertiesDocId);
    PropertiesService.getUserProperties().setProperty('stop', 'false');

    Logger.log(priorCopy.propertiesDocId);  

    return {
        spreadsheetId: priorCopy.spreadsheetId,
        destId: selectedFolder.srcId,
        resuming: true
    };
}