/**
 * Created by eric on 5/18/16.
 */
function resume(selectedFolder) {


    return {
        spreadsheetId: selectedFolder.spreadsheetId,
        destId: selectedFolder.destId,
        resuming: true
    };
}