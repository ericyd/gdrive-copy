/**
 * Created by eric on 5/18/16.
 */
/**
 * Find prior copy folder instance.
 * Find propertiesDoc and logger spreadsheet, and save IDs to userProperties, which will be used by loadProperties.
 *
 * @param options object containing information on folder selected in app
 * @returns {{spreadsheetId: string, destId: string, resuming: boolean}}
 */

function resume(options) {
  var priorCopy = findPriorCopy(options.srcFolderID);

  setUserPropertiesStore(
    priorCopy.spreadsheetId,
    priorCopy.propertiesDocId,
    options.srcFolderID,
    'true'
  );

  return {
    spreadsheetId: priorCopy.spreadsheetId,
    destFolderId: options.srcFolderID,
    resuming: true
  };
}
