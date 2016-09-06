/**
 * get the email of the active user
 */
function getUserEmail() {
    return Session.getActiveUser().getEmail();    
}