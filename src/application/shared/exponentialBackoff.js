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