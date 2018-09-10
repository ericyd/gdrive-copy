const GDriveService = require('../lib/GDriveService');
const assert = require('assert');
const sinon = require('sinon');

describe('GDriveService', function() {
  describe('insertBlankFile()', function() {
    beforeEach(function() {
      this.gDriveService = new GDriveService();
    });
    it('should insert a file to the folder ID it was called with', function() {
      const stubInsert = sinon.stub(this.gDriveService, 'insertFolder');
      const parentID = '1234345346';
      const blankFile = this.gDriveService.insertBlankFile(parentID);
      const arg = stubInsert.getCall(0).args[0];
      assert(
        stubInsert.calledOnce,
        'GDriveservice.insertFolder not called once'
      );
      assert.equal(arg.mimeType, 'text/plain', 'mimetype not text/plain');
      assert.equal(
        arg.parents[0].id,
        parentID,
        'file inserted with wrong parentID'
      );
      assert.notEqual(
        arg.title.indexOf('DO NOT DELETE OR MODIFY'),
        -1,
        "file title does not contain 'DO NOT DELETE OR MODIFY'"
      );
    });
  });
});
