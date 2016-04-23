/**
 * copy permissions from source to destination file/folder
 *
 * @param {string} src metadata for the source folder
 * @param {string} owners list of owners of src file
 * @param {string} dest metadata for the destination folder
 */
function copyPermissions(srcId, owners, destId) {
    Logger.log("src id: " + srcId + " & dest id: " + destId);
    var srcPermissions = getPermissions(srcId);
    var permissions = srcPermissions.items;
    // Logger.log("permissions: " + permissions);
    // var owners = srcData.owners;
    // Logger.log("owners: " + owners);
    var i;

    // copy editors, viewers, and commenters from src file to dest file
    if (permissions && permissions.length > 0){
        for (i = 0; i < permissions.length; i++) {

            // if there is no email address, it is only sharable by link.
            // These permissions will not include an email address, but they will include an ID
            // Permissions.insert requests must include either value or id,
            // thus the need to differentiate between permission types
            if (permissions[i].emailAddress) {
                if (permissions[i].role == "owner") continue;

                Drive.Permissions.insert(
                    {
                        "role": permissions[i].role,
                        "type": permissions[i].type,
                        "value": permissions[i].emailAddress
                    },
                    destId,
                    {
                        'sendNotificationEmails': 'false'
                    });
            } else {
                Drive.Permissions.insert(
                    {
                        "role": permissions[i].role,
                        "type": permissions[i].type,
                        "id": permissions[i].id,
                        "withLink": permissions[i].withLink
                    },
                    destId,
                    {
                        'sendNotificationEmails': 'false'
                    });
            }
        }
    }


    // convert old owners to editors
    if (owners && owners.length > 0){
        for (i = 0; i < owners.length; i++) {
            Drive.Permissions.insert(
                {
                    "role": "writer",
                    "type": "user",
                    "value": owners[i].emailAddress,
                },
                destId,
                {
                    'sendNotificationEmails': 'false'
                });
        }
    }
}