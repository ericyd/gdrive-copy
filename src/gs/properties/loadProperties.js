/**
 * Get userProperties for current users.
 * Get properties object from userProperties.
 * JSON.parse() and values that need parsing
 *
 * @return {object} properties JSON object with current user's properties
 */
function loadProperties() {
    var userProperties, properties, propertiesDoc;

    try {
        // Get properties from propertiesDoc.  FileID for propertiesDoc is saved in userProperties
        propertiesDoc = DriveApp.getFileById(PropertiesService.getUserProperties().getProperties().propertiesDocId).getAs(MimeType.PLAIN_TEXT);
        properties = JSON.parse(propertiesDoc.getDataAsString());
    } catch (err) {
        throw err;
    }

    try {
        try{properties.remaining = JSON.parse(properties.remaining);}catch(e){}
        try{properties.map = JSON.parse(properties.map);}catch(e){} 
        try{properties.permissions = JSON.parse(properties.permissions);}catch(e){}
        try{properties.leftovers = JSON.parse(properties.leftovers);}catch(e){}
        if (properties.leftovers && properties.leftovers.items) {
            try{properties.leftovers.items = JSON.parse(properties.leftovers.items);}catch(e){}
            properties.leftovers.items.forEach(function(obj, i, arr) {
                try{arr[i].owners = JSON.parse(arr[i].owners);}catch(e){}
                try{arr[i].labels = JSON.parse(arr[i].labels);}catch(e){}
                try{arr[i].lastModifyingUser = JSON.parse(arr[i].lastModifyingUser);}catch(e){}
                try{arr[i].lastModifyingUser.picture = JSON.parse(arr[i].lastModifyingUser.picture);}catch(e){}
                try{arr[i].ownerNames = JSON.parse(arr[i].ownerNames);}catch(e){}
                try{arr[i].openWithLinks = JSON.parse(arr[i].openWithLinks);}catch(e){}
                try{arr[i].spaces = JSON.parse(arr[i].spaces);}catch(e){}
                try{arr[i].parents = JSON.parse(arr[i].parents);}catch(e){}
                try{arr[i].userPermission = JSON.parse(arr[i].userPermission);}catch(e){}
            });
        } 

    } catch (err) {
        throw err;
    }


    return properties;
}