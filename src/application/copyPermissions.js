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
    /*
    var srcFile = DriveApp.getFileById(srcId);

    if (srcFile.getMimeType() == "application/vnd.google-apps.spreadsheet") {
        var srcSheet = SpreadsheetApp.openById(srcId);
        var destSheet = SpreadsheetApp.openById(destId);
        var protections = srcSheet.getProtections(SpreadsheetApp.ProtectionType.RANGE);
        var protectionsSheet = srcSheet.getProtections(SpreadsheetApp.ProtectionType.SHEET);
        
        // join the SHEET and RANGE arrays
        // for (var k = 0; k < protectionsSheet.length; k++) {
        //     protections.push(protectionsSheet[k]);
        // }

        var protection, editors, protect, i, j;
        
        for (i = 0; i < protections.length; i++) {
            protection = protections[i];
            editors = protection.getEditors();
            //Logger.log(protections[i].getRange().getA1Notation());
            // protect the dest range
            var name = protections[i].getRange().getSheet().getName();
            var range = protections[i].getRange();
            //Logger.log(name, range);
            
            protect = destSheet.getSheetByName(name).protect();
            Logger.log('name = ' + name + 'range = ' + range + 'protect = ' + protect.getProtectionType());
            
            for (j = 0; j < editors.length; j++) {
                // add editors to the protection
                protect.addEditor(editors[j]);
            }
        }

        for (i = 0; i < protectionsSheet.length; i++) {
            protection = protectionsSheet[i];
            editors = protection.getEditors();
            // protect the dest range
            protect = destSheet.getSheetByName(protections[i].getRange().getSheet().getName()).protect();
            for (j = 0; j < editors.length; j++) {
                // add editors to the protection
                protect.addEditor(editors[j]);
            }
        }
    }
    */
}
