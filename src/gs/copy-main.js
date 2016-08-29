/**
 * Copy folders and files from source to destination.
 * Get parameters from userProperties,
 * Loop until time runs out,
 * then call timeout methods, saveProperties and createTrigger.
 *
 * @param {boolean} resuming whether or not the copy call is resuming an existing folder copy or starting fresh
 */
function copy() {
    // CONSTANTS
    var MAX_RUNNING_TIME = 4.7 * 60000; // return millisecs
    var START_TIME = (new Date()).getTime();
    
    // TODO: clean up variable declarations
    var timeIsUp,       // {boolean} true if max execution time is reached while executing script
        currTime,       // {number} integer representing current time in milliseconds
        ss,             // {object} instance of Sheet class
        //properties is a global object now, stored in the file propertiesObject
        query,          // {string} query to generate Files list
        files,          // {object} list of files within Drive folder
        item,           // {object} metadata of child item from current iteration
        currFolder,     // {object} metadata of folder whose children are currently being processed
        newfile,        // {Object} JSON metadata for newly created folder or file
        timeZone,       // {string} time zone of user
        stop,           // {boolean} true if the user has clicked the 'stop' button
        userProperties = PropertiesService.getUserProperties(), // reference to userProperties store 
        triggerId = userProperties.getProperties().triggerId;      // {string} Unique ID for the most recently created trigger

    stop = userProperties.getProperties().stop == 'true';




    /*****************************
     * Delete previous trigger
     */
    deleteTrigger(triggerId);

    /*****************************
     * Create trigger for next run.
     * This trigger will be deleted if script finishes successfully 
     * or if the stop flag is set.
     */
    createTrigger();




    /*****************************
     * Load properties.
     * If loading properties fails, return the function and
     * set a trigger to retry in 6 minutes.
     */
    try {
        // Load properties and initialize logger spreadsheet
        properties = exponentialBackoff(loadProperties, 'Error restarting script, trying again...');

    } catch (err) {

        var n = Number(userProperties.getProperties().trials);
        Logger.log(n);

        if (n < 5) {
            Logger.log('setting trials property');
            userProperties.setProperty('trials', (n + 1).toString());

            exponentialBackoff(createTrigger,
                'Error setting trigger.  There has been a server error with Google Apps Script.' +
                'To successfully finish copying, please refresh the app and click "Resume Copying"' +
                'and follow the instructions on the page.');
        }
        return;
    }


    /*****************************
     * Initialize logger spreadsheet and timeZone
     */ 
    ss = SpreadsheetApp.openById(properties.spreadsheetId).getSheetByName("Log");
    timeZone = SpreadsheetApp.openById(properties.spreadsheetId).getSpreadsheetTimeZone();
    if (timeZone === undefined || timeZone === null) {
        timeZone = 'GMT-7';
    }

    

    /*****************************
     * Handle leftovers from prior run
     */

    // TODO: Make a separate function processLeftovers() or something like that

    // get current children, or skip if none exist
    if ( properties.leftovers.items && properties.leftovers.items.length > 0) {
        properties.destFolder = properties.leftovers.items[0].parents[0].id;
        processFileList(properties.leftovers.items, timeZone, properties.permissions, userProperties, START_TIME, MAX_RUNNING_TIME, properties.map);    
    } 
    
    
    /*****************************
     * Query the next folder from properties.remaining
     */
    // When leftovers are complete, query next folder from properties.remaining
    Logger.log("beginning processFiles on next remaining folder");    
    while ( properties.remaining.length > 0 && !timeIsUp && !stop) {
        
        try {
            // if pages remained in the previous query, use them first
            if ( properties.pageToken ) {
                currFolder = properties.destFolder;
            } else {
                currFolder = properties.remaining.shift();
            }
        } catch (err) {
            log(ss, [err.message, err.fileName, err.lineNumber, Utilities.formatDate(new Date(), timeZone, "MM-dd-yy hh:mm:ss aaa")]);
        }

        
        
        // build query
        query = '"' + currFolder + '" in parents and trashed = false';
        
        
        // Get fileList using query. 
        // Repeat if pageToken exists (i.e. more than 1000 results return from the query)
        do {

            try {
                // Get fileList
                files = getFiles(query, properties.pageToken);
            } catch (err) {
                log(ss, [err.message, err.fileName, err.lineNumber]);
            }

            // Send items to processFileList() to copy
            if (files.items && files.items.length > 0) {
                processFileList(files.items, timeZone, properties.permissions, userProperties, START_TIME, MAX_RUNNING_TIME, properties.map);
            } else {
                Logger.log('No children found.');
            }
            
            // get next page token to continue iteration
            properties.pageToken = files.nextPageToken;
            
        } while (properties.pageToken && !timeIsUp && !stop);
        
    }
    
    // TODO: Delete trigger if script is complete, or if "stop" is selected
    
    // TODO: Pass log message to saveState() and have it log from within the function
    if (stop) {
        saveState('notrigger');
        log(ss, ["Stopped manually by user.  Please use 'Resume' button to restart copying"]);
        return;
    }
    
    // If timeIsUp, maximum execution time has been reached
    // Update logger spreadsheet, and save current items to properties.leftovers
    if ( timeIsUp ) {
        saveState();     
        log(ss, ["Paused due to Google quota limits - copy will resume in 1-2 minutes"]);
    } else {
        // If script reaches here and !timeIsUp, then the copy is complete!  
        // Delete prior trigger, move propertiesDoc to trash, and update logger spreadsheet,
         

        try {
            Drive.Files.update({"labels": {"trashed": true}},properties.propertiesDocId);
        } catch (err) {
            log(ss, [err.message, err.fileName, err.lineNumber]);
        }
        ss.getRange(2, 3, 1, 1).setValue("Complete").setBackground("#66b22c");
        ss.getRange(2, 4, 1, 1).setValue(Utilities.formatDate(new Date(), timeZone, "MM-dd-yy hh:mm:ss a"));
    }
}