const FileService = require('../lib/FileService');
const GDriveService = require('../lib/GDriveService');
const assert = require('assert');
const fs = require('fs');
const sinon = require('sinon');

describe('FileService', function() {
  beforeEach(function() {
    this.service = new FileService();
    this.mockFolder = JSON.parse(
      fs.readFileSync('test/mocks/insert_folder_response_200.json').toString()
    );
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
      stub.returns(this.mockFolder);
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
      const destFolder = FileService.initializeDestinationFolder(
        options,
        today
      );
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
      spy.restore();
    });

    it('should copy to root when copyTo == root', function() {
      const stubInsert = sinon.stub(GDriveService, 'insertFolder');
      const stubRoot = sinon.stub(GDriveService, 'getRootID');
      const spy = sinon.spy(FileService, 'copyPermissions');
      stubInsert.returns(this.mockFolder);
      const expectedRootID = 'myRootID';
      stubRoot.returns(expectedRootID);
      const options = {
        srcFolderID: '123',
        copyTo: 'root',
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
            id: expectedRootID
          }
        ],
        mimeType: 'application/vnd.google-apps.folder'
      };
      const destFolder = FileService.initializeDestinationFolder(
        options,
        today
      );
      assert.deepEqual(
        stubInsert.getCall(0).args[0],
        requestBody,
        'GDriveService.insertFolder called with wrong args'
      );

      assert(
        spy.notCalled,
        'copyPermissions called when it was not supposed to be called'
      );
      stubInsert.restore();
      stubRoot.restore();
      spy.restore();
    });

    it('should copy to custom when copyTo == custom', function() {
      const stubInsert = sinon.stub(GDriveService, 'insertFolder');
      const stubDescendant = sinon.stub(FileService, 'isDescendant');
      const spy = sinon.spy(FileService, 'copyPermissions');
      stubInsert.returns(this.mockFolder);
      stubDescendant.returns(false);
      const options = {
        srcFolderID: '123',
        copyTo: 'custom',
        copyPermissions: false,
        srcFolderName: '234',
        destFolderName: '345',
        destParentID: 'myDestParentID',
        srcParentID: '456'
      };
      const today = new Date().getTime();
      const requestBody = {
        description: 'Copy of ' + options.srcFolderName + ', created ' + today,
        title: options.destFolderName,
        parents: [
          {
            kind: 'drive#fileLink',
            id: options.destParentID
          }
        ],
        mimeType: 'application/vnd.google-apps.folder'
      };
      const destFolder = FileService.initializeDestinationFolder(
        options,
        today
      );
      assert.deepEqual(
        stubInsert.getCall(0).args[0],
        requestBody,
        'GDriveService.insertFolder called with wrong args'
      );

      assert(
        spy.notCalled,
        'copyPermissions called when it was not supposed to be called'
      );
      stubInsert.restore();
      stubDescendant.restore();
      spy.restore();
    });
    it('should test `isDescendent()` when copyTo == custom', function() {
      const stubInsert = sinon.stub(GDriveService, 'insertFolder');
      const stubDescendant = sinon.stub(FileService, 'isDescendant');
      const spy = sinon.spy(FileService, 'copyPermissions');
      stubInsert.returns(this.mockFolder);
      stubDescendant.returns(false);
      const options = {
        copyTo: 'custom',
        copyPermissions: false,
        srcFolderName: '234',
        srcFolderID: '234',
        destFolderName: '345',
        destParentID: 'myDestParentID'
      };
      const today = new Date().getTime();
      const destFolder = FileService.initializeDestinationFolder(
        options,
        today
      );

      assert(
        spy.notCalled,
        'copyPermissions called when it was not supposed to be called'
      );
      assert(
        stubDescendant.calledOnce,
        'isDescendant should have been called once'
      );
      stubInsert.restore();
      stubDescendant.restore();
      spy.restore();
    });

    it('should copy permissions when copyPermissions == custom', function() {
      const stubInsert = sinon.stub(GDriveService, 'insertFolder');
      const stubCopyPermissions = sinon.stub(FileService, 'copyPermissions');
      stubInsert.returns(this.mockFolder);
      stubCopyPermissions.returns(false);
      const options = {
        copyTo: 'same',
        copyPermissions: true,
        srcFolderName: '234',
        srcFolderID: '234',
        destFolderName: '345',
        destParentID: 'myDestParentID'
      };
      const today = new Date().getTime();
      const destFolder = FileService.initializeDestinationFolder(
        options,
        today
      );

      assert(
        stubCopyPermissions.calledOnce,
        'copy permissions should have been called once'
      );
      assert.equal(
        stubCopyPermissions.getCall(0).args[0],
        options.srcFolderID,
        'copy permissions called with wrong source id'
      );
      assert.equal(
        stubCopyPermissions.getCall(0).args[1],
        null,
        'copy permissions called with wrong owners'
      );
      assert.equal(
        stubCopyPermissions.getCall(0).args[2],
        destFolder.id,
        'copy permissions called with wrong destination id'
      );
      stubInsert.restore();
      stubCopyPermissions.restore();
    });
  });

  describe('copyFile()', function() {
    // folders are files too in GDrive
    describe('when file is a folder', function() {
      it('should insert folder', function() {
        const file = {
          description: 'myDescription',
          title: 'myTitle',
          parents: [
            {
              kind: 'drive#fileLink',
              id: 'myParentID'
            }
          ],
          mimeType: 'application/vnd.google-apps.folder'
        };
        const request = Object.assign({}, file, {
          parents: [
            {
              kind: 'drive#fileLink',
              id: 'newParentID'
            }
          ]
        });
        const stubInsert = sinon.stub(GDriveService, 'insertFolder');
        stubInsert.returns(this.mockFolder);
        const map = {
          myParentID: 'newParentID'
        };
        const properties = { remaining: [] };

        const newFolder = FileService.copyFile(file, map, properties);
        assert.deepEqual(
          stubInsert.getCall(0).args[0],
          request,
          'GDriveService.insertFolder called with wrong args'
        );
        assert.deepEqual(
          newFolder,
          this.mockFolder,
          'copyFile did not return correct value'
        );

        stubInsert.restore();
      });

      it('should add new folder to properties.remaining and map', function() {
        const file = {
          id: 'myFileID',
          description: 'myDescription',
          title: 'myTitle',
          parents: [
            {
              kind: 'drive#fileLink',
              id: 'myParentID'
            }
          ],
          mimeType: 'application/vnd.google-apps.folder'
        };
        const stubInsert = sinon.stub(GDriveService, 'insertFolder');

        stubInsert.returns(this.mockFolder);
        const map = {
          myParentID: 'newParentID'
        };
        const properties = { remaining: [] };

        const newFolder = FileService.copyFile(file, map, properties);
        assert.deepEqual(
          newFolder,
          this.mockFolder,
          'copyFile did not return correct value'
        );
        console.log(properties, map);
        assert.equal(
          properties.remaining[0],
          file.id,
          'properties.remaining did not get correct value added'
        );
        assert.equal(
          map[file.id],
          newFolder.id,
          'folder did not get mapped correctly from source to destination'
        );

        stubInsert.restore();
      });

      xit('should log an error if insert fails', function() {
        const stubLog = sinon.stub(GDriveService, 'log');
        stubLog.restore();
      });
    });

    describe('when file is not a folder', function() {
      xit('should copy a file', function() {});
      xit('should log an error if copy fails', function() {});
    });
  });
});
