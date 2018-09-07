global.PropertiesService = require('./mocks/PropertiesService');
global.Utilities = require('./mocks/Utilities');
const Properties = require('../lib/Properties');
const Timer = require('../lib/Timer');
const GDriveService = require('../lib/GDriveService');
const sinon = require('sinon');
const assert = require('assert');
const fs = require('fs');

describe('Properties', function() {
  beforeEach(function() {
    this.gDriveService = new GDriveService();
    this.properties = new Properties(this.gDriveService);
    this.mockPropertiesDoc = fs
      .readFileSync('test/mocks/properties_document_stringified.txt')
      .toString();
  });
  describe('load()', function() {
    it('should assign properties to `this`', function() {
      // set up mocks
      const stubFile = sinon.stub(this.gDriveService, 'downloadFile');
      stubFile.returns(this.mockPropertiesDoc);

      // set up actual
      const loadedProps = this.properties.load();

      // assertions
      const mockDoc = JSON.parse(this.mockPropertiesDoc);
      Object.entries(this.properties).forEach(([key, value]) => {
        if (key == 'gDriveService') return;
        assert.deepEqual(value, mockDoc[key]);
      });

      // reset mocks
      stubFile.restore();
    });
    it('should return parsing error if not JSON-parsable', function() {
      // set up mocks
      const stubFile = sinon.stub(this.gDriveService, 'downloadFile');
      stubFile.returns(this.mockPropertiesDoc.slice(3));

      // assertions
      assert.throws(
        () => {
          this.properties.load.call(this.properties);
        },
        Error,
        "Unable to parse the properties document. This is likely a bug, but it is worth trying one more time to make sure it wasn't a fluke."
      );

      // reset mocks
      stubFile.restore();
    });
    it('should return human readable error if propertiesDocID is undefined', function() {
      // set up mocks
      const stubFile = sinon.stub(this.gDriveService, 'downloadFile');
      stubFile.throws(new Error('Unsupported Output Format'));

      // assertions
      assert.throws(
        () => {
          this.properties.load.call(this.properties);
        },
        Error,
        'Could not determine properties document ID. Please try running the script again'
      );

      // reset mocks
      stubFile.restore();
    });
  });
  describe('save()', function() {
    it('should throw critical error if properties cannot be serialized', function() {
      function Circular() {
        this.abc = 'Hello';
        this.circular = this;
      }
      const circular = new Circular();
      assert.throws(
        () => {
          Properties.save(circular);
        },
        Error,
        'Failed to serialize script properties. This is a critical failure. Please start your copy again.'
      );
    });
    it('should update file with stringified props', function() {
      // set up mocks
      const stubUpdate = sinon.stub(this.gDriveService, 'updateFile');

      // set up actual
      const myProps = {
        prop1: 1,
        prop2: 2,
        leftovers: [
          { id: 123, parents: [{ id: 234 }] },
          { id: 345, parents: [{ id: 985 }] }
        ],
        map: {
          prop3: 3,
          prop4: 4
        }
      };
      Properties.save(myProps, this.gDriveService);

      // assertions
      assert.equal(
        stubUpdate.getCall(0).args[2],
        JSON.stringify(myProps),
        'properties argument not stringified correctly'
      );
    });
  });
  it('should increment totalRuntime', function() {
    this.properties.incrementTotalRuntime(50);
    assert.equal(
      this.properties.totalRuntime,
      50,
      'totalRuntime not incremented properly'
    );
  });
  it('should determine if max runtime is exceeded', function() {
    assert(
      !this.properties.checkMaxRuntime(),
      'initialized properties over max runtime'
    );
    this.properties.incrementTotalRuntime(Timer.MAX_RUNTIME_PER_DAY);
    assert(
      this.properties.checkMaxRuntime(),
      "properties doesn't calculate max runtime correctly"
    );
  });
});
