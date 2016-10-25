/**
 * copy permissions from source to destination file/folder
 *
 * @param {string} srcId metadata for the source folder
 * @param {string} owners list of owners of src file
 * @param {string} destId metadata for the destination folder
 */
function copyPermissions(srcId, owners, destId) {
    var permissions, destPermissions, i, j;

    try {
        permissions = getPermissions(srcId).items;
    } catch (err) {
        log(null, [err.message, err.fileName, err.lineNumber]);
    }


    // copy editors, viewers, and commenters from src file to dest file
    if (permissions && permissions.length > 0){
        for (i = 0; i < permissions.length; i++) {

            // if there is no email address, it is only sharable by link.
            // These permissions will not include an email address, but they will include an ID
            // Permissions.insert requests must include either value or id,
            // thus the need to differentiate between permission types
            try {
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
            } catch (err) {}

        }
    }


    // convert old owners to editors
    if (owners && owners.length > 0){
        for (i = 0; i < owners.length; i++) {
            try {
                Drive.Permissions.insert(
                    {
                        "role": "writer",
                        "type": "user",
                        "value": owners[i].emailAddress
                    },
                    destId,
                    {
                        'sendNotificationEmails': 'false'
                    });
            } catch (err) {}

        }
    }



    // remove permissions that exist in dest but not source
    // these were most likely inherited from parent

    try {
        destPermissions = getPermissions(destId).items;
    } catch (err) {
        log(null, [err.message, err.fileName, err.lineNumber]);
    }

    if (destPermissions && destPermissions.length > 0) {
        for (i = 0; i < destPermissions.length; i++) {
            for (j = 0; j < permissions.length; j++) {
                if (destPermissions[i].id == permissions[j].id) {
                    break;
                }
                // if destPermissions does not exist in permissions, delete it
                if (j == permissions.length - 1 && destPermissions[i].role != 'owner') {
                    Drive.Permissions.remove(destId, destPermissions[i].id);
                }
            }
        }
    }


    // TODO: figure out why the protections are copied with more editors than the src

    // copy protected ranges from original sheet
    if (DriveApp.getFileById(srcId).getMimeType() == "application/vnd.google-apps.spreadsheet") {
        var srcSS = SpreadsheetApp.openById(srcId);
        var destSS = SpreadsheetApp.openById(destId);
        Logger.log("mime type matched");
        var srcProtections, srcProtection, destProtections, destProtection, destSheet, editors, protect, h, i, j, k;
        srcProtections = srcSS.getProtections(SpreadsheetApp.ProtectionType.RANGE);
        for (i = 0; i < srcProtections.length; i++) {
            srcProtection = srcProtections[i];
            editors = srcProtection.getEditors();
            destSheet = destSS.getSheetByName(srcProtection.getRange().getSheet().getName());
            destProtections = destSheet.getProtections(SpreadsheetApp.ProtectionType.RANGE);
            Logger.log("dest protections assigned");
            Logger.log("dest protections.length = " + destProtections.length);
            for (j = 0; j < destProtections.length; j++) {
                // remove existing protections
                destProtections[j].remove();
                Logger.log("destProtection removed");

                // set protection by sheet or by range
                if (srcProtection.getRange().getA1Notation() === 'A1') {
                    destProtection = destSheet.protect();
                } else {
                    destProtection = destSheet.getRange(srcProtection.getRange().getA1Notation()).protect();
                }

                Logger.log("dest protection set");
                Logger.log("dest protection type = " + destProtection.getProtectionType());
                
                // add editors
                for (k = 0; k < editors.length; k++) {
                    destProtection.addEditor(editors[k]);
                    Logger.log('adding editor ' + editors[k] + ' to ' + srcProtection.getRange().getSheet().getName() + ' ' + srcProtection.getRange().getA1Notation());
                }
            }
        }
    }
}