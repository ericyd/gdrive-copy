const FileService = require('../lib/FileService');
const GDriveService = require('../lib/GDriveService');
const assert = require('assert');
const fs = require('fs');
const sinon = require('sinon');

describe('FileService', function() {
  beforeEach(function() {
    this.service = new FileService();
  });

  describe('createLoggerSpreadsheet()', function() {
    it('should return newly created file resource', function() {
      const stub = sinon.stub(GDriveService, 'copyFile');
      const mockCopy = fs
        .readFileSync('test/mocks/copy_file_response_200.json')
        .toString();
      stub.returns(mockCopy);
      const expected = {
        today: new Date().getTime(),
        destID: '1234'
      };
      const copy = FileService.createLoggerSpreadsheet(
        expected.today,
        expected.destID
      );
      assert.equal(copy, mockCopy, 'returns wrong value');
      // TODO: this id shouldn't be hardcoded like this
      assert.equal(
        stub.getCall(0).args[1],
        '17xHN9N5KxVie9nuFFzCur7WkcMP7aLG4xsPis8Ctxjg',
        'GDriveService.copyFile called with wrong id'
      );
      const requestBody = {
        title: 'Copy Folder Log ' + expected.today,
        parents: [
          {
            kind: 'drive#fileLink',
            id: expected.destID
          }
        ]
      };
      assert.deepEqual(
        stub.getCall(0).args[0],
        requestBody,
        'GDriveService.copyFile called with wrong body'
      );

      stub.restore();
    });

    it('should return error message if GDriveService.copyFile fails', function() {
      const stub = sinon.stub(GDriveService, 'copyFile');
      const errMsg = 'Error copying selected folder';
      stub.throws(new Error(errMsg));
      const copy = FileService.createLoggerSpreadsheet(1, 2);
      assert.equal(copy, errMsg, 'does not return error message');

      stub.restore();
    });
  });

  describe('initializeDestinationFolder()', function() {
    it('should copy to options.srcFolderID when copyTo == same', function() {
      const stub = sinon.stub(GDriveService, 'insertFolder');
      const spy = sinon.spy(FileService, 'copyPermissions');
      const mockFolder = fs
        .readFileSync('test/mocks/insert_folder_response_200.json')
        .toString();
      stub.returns(mockFolder);
      const options = {
        srcFolderID: '123',
        copyTo: 'same',
        copyPermissions: false,
        srcFolderName: '234',
        destFolderName: '345',
        srcParentID: '456'
      };
      const today = new Date().getTime();
      const requestBody = {
        description: 'Copy of ' + options.srcFolderName + ', created ' + today,
        title: options.destFolderName,
        parents: [
          {
            kind: 'drive#fileLink',
            id: options.srcParentID
          }
        ],
        mimeType: 'application/vnd.google-apps.folder'
      };
      const destFolder = FileService.initializeDestinationFolder(options, today);
      assert.deepEqual(
        stub.getCall(0).args[0],
        requestBody,
        'GDriveService.insertFolder called with wrong args'
      );

      assert(
        spy.notCalled,
        'copyPermissions called when it was not supposed to be called'
      );
      stub.restore();
    });

    it('should copy to root when copyTo == root', function() {
      assert(false, "write test");
    })
    it('should copy to custom when copyTo == custom', function() {
      assert(false, "write test");
    })
  });
});
