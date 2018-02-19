global.PropertiesService = require('./mocks/PropertiesService');
const Properties = require('../lib/Properties');
const GDriveService = require('../lib/GDriveService');
const sinon = require('sinon');
const assert = require('assert');
const fs = require('fs');

describe('Properties', function() {
  beforeEach(function() {
    this.properties = new Properties();
    this.mockPropertiesDoc = fs
      .readFileSync('test/mocks/properties_document_stringified.txt')
      .toString();
  });
  describe('loadProperties()', function() {
    it('should assign properties to `this`', function() {
      // set up mocks
      const stubFile = sinon.stub(GDriveService, 'downloadFile');
      stubFile.returns(this.mockPropertiesDoc);

      // set up actual
      const loadedProps = this.properties.loadProperties.call(this.properties);

      // assertions
      assert.deepEqual(loadedProps, JSON.parse(this.mockPropertiesDoc));

      // reset mocks
      stubFile.restore();
    });
    it('should return parsing error if not JSON-parsable', function() {
      // set up mocks
      const stubFile = sinon.stub(GDriveService, 'downloadFile');
      stubFile.returns(this.mockPropertiesDoc.slice(3));

      // assertions
      assert.throws(() => {
        this.properties.loadProperties.call(this.properties);
      }, "Unable to parse the properties document. This is likely a bug, but it is worth trying one more time to make sure it wasn't a fluke.");

      // reset mocks
      stubFile.restore();
    });
    it('should return human readable error if propertiesDocID is undefined', function() {
      // set up mocks
      const stubFile = sinon.stub(GDriveService, 'downloadFile');
      stubFile.throws(new Error('Unsupported Output Format'));

      // assertions
      assert.throws(() => {
        this.properties.loadProperties.call(this.properties);
      }, 'Could not determine properties document ID. Please try running the script again');

      // reset mocks
      stubFile.restore();
    });
  });
  describe('saveProperties()', function() {
    it('should throw critical error if properties cannot be serialized', function() {
      function Circular() {
        this.abc = 'Hello';
        this.circular = this;
      }
      const circular = new Circular();
      assert.throws(() => {
        Properties.saveProperties(circular);
      }, 'Failed to serialize script properties. This is a critical failure. Please start your copy again.');
    });
    xit('should stringify whatever props are sent to it', function() {});
    xit('should update file with stringified props', function() {});
  });
});
