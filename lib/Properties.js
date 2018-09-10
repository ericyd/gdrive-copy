/**********************************************
 * Contains runtime properties for script
 **********************************************/

//removeIf(production)
// Google Apps Script doesn't play well with module.exports,
// but it is required for testing
const Util = require('./Util');
const Timer = require('./Timer');
//endRemoveIf(production)

function Properties(gDriveService) {
  this.gDriveService = gDriveService;
  this.srcFolderID = '';
  this.srcFolderName = '';
  this.srcParentID = '';
  this.destFolderName = '';
  this.copyPermissions = false;
  this.copyTo = '';
  this.destParentID = '';
  this.destId = '';
  this.spreadsheetId = '';
  this.propertiesDocId = '';
  this.leftovers = {};
  this.map = {};
  this.remaining = [];
  this.timeZone = 'GMT-7';
  this.totalRuntime = 0;

  return this;
}

/**
 * Load properties document from user's drive and parse.
 * @return {object} properties object
 */
Properties.prototype.load = function() {
  var _this = this;
  try {
    var propertiesDocId = PropertiesService.getUserProperties().getProperties()
      .propertiesDocId;
    var propertiesDoc = this.gDriveService.downloadFile(propertiesDocId);
  } catch (e) {
    if (e.message.indexOf('Unsupported Output Format') !== -1) {
      throw new Error(
        'Could not determine properties document ID. Please try running the script again'
      );
    }
    throw e;
  }

  try {
    var properties = JSON.parse(propertiesDoc);
  } catch (e) {
    throw new Error(
      "Unable to parse the properties document. This is likely a bug, but it is worth trying one more time to make sure it wasn't a fluke."
    );
  }

  Object.keys(properties).forEach(function(prop) {
    try {
      _this[prop] = properties[prop];
    } catch (e) {
      throw new Error(
        'Error loading property ' +
          prop +
          ' to properties object. Attempted to save: ' +
          properties[prop]
      );
    }
  });

  return this;
};

/**
 * Increment `totalRuntime` property
 * @param {number} ms amount in milliseconds to increment
 */
Properties.prototype.incrementTotalRuntime = function(ms) {
  this.totalRuntime += ms;
};

/**
 * Determine if script has exceeded max daily runtime
 * If yes, need to sleep for one day to avoid throwing
 * "Script using too much computer time" error
 * @returns {boolean}
 */
Properties.prototype.checkMaxRuntime = function() {
  this.isOverMaxRuntime =
    this.totalRuntime + Timer.MAX_RUNTIME >= Timer.MAX_RUNTIME_PER_DAY;
  return this.isOverMaxRuntime;
};

/**
 * Stringify properties argument and save to file in user's Drive
 *
 * @param {object} properties - contains all properties that need to be saved to userProperties
 */
Properties.save = function(properties, gDriveService) {
  try {
    var stringifiedProps = JSON.stringify(properties);
  } catch (e) {
    throw new Error(
      'Failed to serialize script properties. This is a critical failure. Please start your copy again.'
    );
  }
  return gDriveService.updateFile(
    {
      upload: 'multipart',
      alt: 'json'
    },
    properties.propertiesDocId,
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
