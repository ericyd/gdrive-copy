/**
 * Loops through array of files.items,
 * Applies Drive function to each (i.e. copy),
 * Logs result,
 * Copies permissions if selected and if file is a Drive document,
 * Get current runtime and decide if processing needs to stop. 
 * 
 * @param {Array} items the list of files over which to iterate
 */
function processFileList(items, timeZone, permissions, userProperties, timers, map, ss) {
    var item
       ,newfile;
    
    while (items.length > 0 && !timers.timeIsUp && !timers.stop) {
        /*****************************
         * Get next file from passed file list.
         */
        item = items.pop();
        



        /*****************************
         * Copy each (files and folders are both represented the same in Google Drive)
         */
        newfile = copyFile(item, map);




        /*****************************
         * Log result
         */
        if (newfile.id) {
            log(ss, [
                "Copied",
                newfile.title,
                '=HYPERLINK("https://drive.google.com/open?id=' + newfile.id + '","'+ newfile.title + '")',
                newfile.id,
                Utilities.formatDate(new Date(), timeZone, "MM-dd-yy hh:mm:ss aaa")
            ]);
        } else { // newfile is error
            log(ss, [
                "Error, " + newfile,
                item.title,
                '=HYPERLINK("https://drive.google.com/open?id=' + item.id + '","'+ item.title + '")',
                item.id,
                Utilities.formatDate(new Date(), timeZone, "MM-dd-yy hh:mm:ss aaa")
            ]);
        }
        
        

        
        /*****************************
         * Copy permissions if selected, and if permissions exist to copy
         */
        if (permissions) {
            if (item.mimeType == "application/vnd.google-apps.document" ||
                item.mimeType == "application/vnd.google-apps.folder" ||
                item.mimeType == "application/vnd.google-apps.spreadsheet" ||
                item.mimeType == "application/vnd.google-apps.presentation" ||
                item.mimeType == "application/vnd.google-apps.drawing" ||
                item.mimeType == "application/vnd.google-apps.form" ||
                item.mimeType == "application/vnd.google-apps.script" ) {
                    copyPermissions(item.id, item.owners, newfile.id);
            }   
        }




        /*****************************
         * Update current runtime and user stop flag
         */
        timers.update(userProperties);
    }
}