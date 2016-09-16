/**
 * Loop through keys in properties argument,
 * converting any JSON objects to strings.
 * On completetion, save propertiesToSave to userProperties
 *
 * @param {object} properties - contains all properties that need to be saved to userProperties
 */
function saveProperties(properties) {
    try{properties.remaining = JSON.stringify(properties.remaining);}catch(e){}
    try{properties.map = JSON.stringify(properties.map);}catch(e){}
    try{properties.permissions = JSON.stringify(properties.permissions);}catch(e){} 
    try{properties.leftovers = JSON.stringify(properties.leftovers);}catch(e){}
    if (properties.leftovers && properties.leftovers.items) {
        try{properties.leftovers.items = JSON.stringify(properties.leftovers.items);}catch(e){}
        properties.leftovers.items.forEach(function(obj, i, arr) {
            try{arr[i].owners = JSON.stringify(arr[i].owners);}catch(e){}
            try{arr[i].labels = JSON.stringify(arr[i].labels);}catch(e){}
            try{arr[i].lastModifyingUser = JSON.stringify(arr[i].lastModifyingUser);}catch(e){}
            try{arr[i].lastModifyingUser.picture = JSON.stringify(arr[i].lastModifyingUser.picture);}catch(e){}
            try{arr[i].ownerNames = JSON.stringify(arr[i].ownerNames);}catch(e){}
            try{arr[i].openWithLinks = JSON.stringify(arr[i].openWithLinks);}catch(e){}
            try{arr[i].spaces = JSON.stringify(arr[i].spaces);}catch(e){}
            try{arr[i].parents = JSON.stringify(arr[i].parents);}catch(e){}
            try{arr[i].userPermission = JSON.stringify(arr[i].userPermission);}catch(e){}
        });
    }

    try {
        DriveApp.getFileById(PropertiesService.getUserProperties().getProperties().propertiesDocId).setContent(JSON.stringify(properties));
    } catch (e) {
        throw e;
    }
}