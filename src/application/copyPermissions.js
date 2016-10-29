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


    // copy protected ranges from original sheet
    if (DriveApp.getFileById(srcId).getMimeType() == "application/vnd.google-apps.spreadsheet") {
        var srcSS = SpreadsheetApp.openById(srcId);
        var destSS = SpreadsheetApp.openById(destId);
        var srcProtectionsR, srcProtectionsS, srcProtection, destProtectionsR, destProtectionsS, destProtection, destSheet, editors, editorEmails, protect, h, i, j, k;
        srcProtectionsR = srcSS.getProtections(SpreadsheetApp.ProtectionType.RANGE);
        srcProtectionsS = srcSS.getProtections(SpreadsheetApp.ProtectionType.SHEET);
        // copy the RANGE protections
        for (i = 0; i < srcProtectionsR.length; i++) {
            srcProtection = srcProtectionsR[i];
            editors = srcProtection.getEditors();
            destSheet = destSS.getSheetByName(srcProtection.getRange().getSheet().getName());
            destProtectionsR = destSheet.getProtections(SpreadsheetApp.ProtectionType.RANGE);
            for (j = 0; j < destProtectionsR.length; j++) {
                // add editors
                editorEmails = [];
                for (k = 0; k < editors.length; k++) {
                    editorEmails.push(editors[k].getEmail());
                }
                destProtectionsR[j].addEditors(editorEmails);
                Logger.log('adding editors ' + editorEmails + ' to ' + destProtectionsR[j].getRange().getSheet().getName() + ' ' + destProtectionsR[j].getRange().getA1Notation());
            }
        }
        // copy the SHEET protections
        for (i = 0; i < srcProtectionsS.length; i++) {
            srcProtection = srcProtectionsS[i];
            editors = srcProtection.getEditors();
            destSheet = destSS.getSheetByName(srcProtection.getRange().getSheet().getName());
            destProtectionsS = destSheet.getProtections(SpreadsheetApp.ProtectionType.SHEET);
            for (j = 0; j < destProtectionsS.length; j++) {
                // add editors
                editorEmails = [];
                for (k = 0; k < editors.length; k++) {
                    editorEmails.push(editors[k].getEmail());
                }
                destProtectionsS[j].addEditors(editorEmails);
                Logger.log('adding editors ' + editorEmails + ' to ' + destProtectionsS[j].getRange().getSheet().getName() + ' ' + destProtectionsS[j].getRange().getA1Notation());
            }
        }
    }
}