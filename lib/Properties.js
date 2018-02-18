function Properties(PropertiesService) {
  this.propertiesDocId = PropertiesService.getUserProperties().getProperties().propertiesDocId;
  return this;
}

// STATIC METHODS
//============================

/**
 * Load properties document from user's drive and parse.
 * Save results to `this`
 *
 * @return {object} properties JSON object with current user's properties
 */
Properties.prototype.loadProperties = function() {
  var propertiesDoc = GDriveService.downloadFile(this.propertiesDocId);
  var properties = JSON.parse(propertiesDoc);
  Object.keys(properties).forEach(prop => {
    this[prop] = properties[prop];
  });

  return this;
};

/**
 * Stringify properties argument and save to file in user's Drive
 *
 * @param {object} properties - contains all properties that need to be saved to userProperties
 */
Properties.saveProperties = function(properties) {
  var stringifiedProps = JSON.stringify(properties);
  return GDriveService.updateFile(
    {
      upload: 'multipart',
      alt: 'json'
    },
    PropertiesService.getUserProperties().getProperties().propertiesDocId,
    Utilities.newBlob(stringifiedProps)
  );
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
