function Properties() {
  this.props = 'my Properties';
  return this;
}

var properties = {};

// STATIC METHODS
//============================

/**
 * Get userProperties for current users.
 * Get properties object from userProperties.
 * JSON.parse() and values that need parsing
 *
 * @return {object} properties JSON object with current user's properties
 */
Properties.loadProperties = function() {
  var userProperties, properties, propertiesDoc;

  // TODO: why did I write try/catch where the catch just throws the err???
  try {
    propertiesDoc = GDriveService.getPropertiesDoc();
    properties = JSON.parse(propertiesDoc.getDataAsString());
  } catch (err) {
    throw err;
  }

  try {
    properties.remaining = JSON.parse(properties.remaining);
    properties.map = JSON.parse(properties.map);
    properties.permissions = JSON.parse(properties.permissions);
    properties.leftovers = JSON.parse(properties.leftovers);
    if (properties.leftovers && properties.leftovers.items) {
      properties.leftovers.items = JSON.parse(properties.leftovers.items);
      properties.leftovers.items.forEach(function(obj, i, arr) {
        arr[i].owners = JSON.parse(arr[i].owners);
        arr[i].labels = JSON.parse(arr[i].labels);
        arr[i].lastModifyingUser = JSON.parse(arr[i].lastModifyingUser);
        arr[i].lastModifyingUser.picture = JSON.parse(
          arr[i].lastModifyingUser.picture
        );
        arr[i].ownerNames = JSON.parse(arr[i].ownerNames);
        arr[i].openWithLinks = JSON.parse(arr[i].openWithLinks);
        arr[i].spaces = JSON.parse(arr[i].spaces);
        arr[i].parents = JSON.parse(arr[i].parents);
        arr[i].userPermission = JSON.parse(arr[i].userPermission);
      });
    }
  } catch (err) {
    throw err;
  }

  return properties;
};

/**
 * Loop through keys in properties argument,
 * converting any JSON objects to strings.
 * On completetion, save propertiesToSave to userProperties
 *
 * @param {object} properties - contains all properties that need to be saved to userProperties
 */
Properties.saveProperties = function(properties) {
  properties.remaining = JSON.stringify(properties.remaining);
  properties.map = JSON.stringify(properties.map);
  properties.permissions = JSON.stringify(properties.permissions);
  properties.leftovers = JSON.stringify(properties.leftovers);
  if (properties.leftovers && properties.leftovers.items) {
    properties.leftovers.items = JSON.stringify(properties.leftovers.items);
    properties.leftovers.items.forEach(function(obj, i, arr) {
      arr[i].owners = JSON.stringify(arr[i].owners);
      arr[i].labels = JSON.stringify(arr[i].labels);
      arr[i].lastModifyingUser = JSON.stringify(arr[i].lastModifyingUser);
      arr[i].lastModifyingUser.picture = JSON.stringify(
        arr[i].lastModifyingUser.picture
      );
      arr[i].ownerNames = JSON.stringify(arr[i].ownerNames);
      arr[i].openWithLinks = JSON.stringify(arr[i].openWithLinks);
      arr[i].spaces = JSON.stringify(arr[i].spaces);
      arr[i].parents = JSON.stringify(arr[i].parents);
      arr[i].userPermission = JSON.stringify(arr[i].userPermission);
    });
  }

  try {
    GDriveService.setPropertiesDoc(properties);
  } catch (e) {
    throw e;
  }
};

/**
 * save srcId, destId, copyPermissions, spreadsheetId to userProperties.
 *
 * This is used when resuming, in which case the IDs of the logger spreadsheet and
 * properties document will not be known.
 */
Properties.setUserPropertiesStore = function(
  spreadsheetId,
  propertiesDocId,
  destId,
  resuming
) {
  var userProperties = PropertiesService.getUserProperties();
  userProperties.setProperty('destId', destId);
  userProperties.setProperty('spreadsheetId', spreadsheetId);
  userProperties.setProperty('propertiesDocId', propertiesDocId);
  userProperties.setProperty('trials', 0);
  userProperties.setProperty('resuming', resuming);
  userProperties.setProperty('stop', 'false');
};


//removeIf(production)
// Google Apps Script doesn't play well with module.exports,
// but it is required for testing
module.exports = Properties;
//endRemoveIf(production)