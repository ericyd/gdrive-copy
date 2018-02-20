global.Utilities = require('./mocks/Utilities');
const FileService = require('../lib/FileService');
const GDriveService = require('../lib/GDriveService');
const Util = require('../lib/Util');
const Timer = require('../lib/Timer');
const Properties = require('../lib/Properties');
const PropertiesService = require('./mocks/PropertiesService');
const assert = require('assert');
const fs = require('fs');
const sinon = require('sinon');

describe('FileService', function() {
  beforeEach(function() {
    this.service = new FileService();
    this.mockFolder = JSON.parse(
      fs.readFileSync('test/mocks/insert_folder_response_200.json').toString()
    );
    this.mockFile = JSON.parse(
      fs.readFileSync('test/mocks/copy_file_response_200.json').toString()
    );
    this.mockFolderResource = {
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
    this.mockFileResource = {
      id: 'myFileID',
      description: 'myDescription',
      title: 'myTitle',
      parents: [
        {
          kind: 'drive#fileLink',
          id: 'myParentID'
        }
      ],
      mimeType: 'application/vnd.google-apps.document'
    };
    this.map = {
      myParentID: 'newParentID'
    };
    this.properties = new Properties();
    this.userProperties = PropertiesService.getUserProperties();
    this.timer = new Timer();
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
      // set up mocks
      const stubInsert = sinon.stub(GDriveService, 'insertFolder');
      const stubRoot = sinon.stub(GDriveService, 'getRootID');
      const spy = sinon.spy(FileService, 'copyPermissions');
      stubInsert.returns(this.mockFolder);
      const expectedRootID = 'myRootID';
      stubRoot.returns(expectedRootID);

      // set up actual
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

      // assertions
      assert.deepEqual(
        stubInsert.getCall(0).args[0],
        requestBody,
        'GDriveService.insertFolder called with wrong args'
      );

      assert(
        spy.notCalled,
        'copyPermissions called when it was not supposed to be called'
      );

      // restore mocks
      stubInsert.restore();
      stubRoot.restore();
      spy.restore();
    });

    it('should copy to custom when copyTo == custom', function() {
      // set up mocks
      const stubInsert = sinon.stub(GDriveService, 'insertFolder');
      const stubDescendant = sinon.stub(FileService, 'isDescendant');
      const spy = sinon.spy(FileService, 'copyPermissions');
      stubInsert.returns(this.mockFolder);
      stubDescendant.returns(false);

      // set up actual
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

      // assertions
      assert.deepEqual(
        stubInsert.getCall(0).args[0],
        requestBody,
        'GDriveService.insertFolder called with wrong args'
      );

      assert(
        spy.notCalled,
        'copyPermissions called when it was not supposed to be called'
      );

      // restore mocks
      stubInsert.restore();
      stubDescendant.restore();
      spy.restore();
    });
    it('should test `isDescendent()` when copyTo == custom', function() {
      // set up mocks
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

      // set up actual
      const today = new Date().getTime();
      const destFolder = FileService.initializeDestinationFolder(
        options,
        today
      );

      // assertions
      assert(
        spy.notCalled,
        'copyPermissions called when it was not supposed to be called'
      );
      assert(
        stubDescendant.calledOnce,
        'isDescendant should have been called once'
      );

      // restore mocks
      stubInsert.restore();
      stubDescendant.restore();
      spy.restore();
    });

    it('should copy permissions when copyPermissions == custom', function() {
      // set up mocks
      const stubInsert = sinon.stub(GDriveService, 'insertFolder');
      const stubCopyPermissions = sinon.stub(FileService, 'copyPermissions');
      stubInsert.returns(this.mockFolder);
      stubCopyPermissions.returns(false);

      // set up actual
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

      // assertions
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

      // restore mocks
      stubInsert.restore();
      stubCopyPermissions.restore();
    });
  });

  describe('copyFile()', function() {
    // folders are files too in GDrive
    describe('when file is a folder', function() {
      it('should insert folder', function() {
        // set up mocks
        const request = {
          description: 'myDescription',
          title: 'myTitle',
          parents: [
            {
              kind: 'drive#fileLink',
              id: 'newParentID'
            }
          ],
          mimeType: 'application/vnd.google-apps.folder'
        };
        const stubInsert = sinon.stub(GDriveService, 'insertFolder');
        stubInsert.returns(this.mockFolder);

        // set up actual
        const newFolder = FileService.copyFile(
          this.mockFolderResource,
          this.map,
          this.properties
        );

        // assertions
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

        // restore mocks
        stubInsert.restore();
      });

      it('should add new folder to properties.remaining and map', function() {
        // set up mocks
        const stubInsert = sinon.stub(GDriveService, 'insertFolder');
        stubInsert.returns(this.mockFolder);

        // set up actual
        const newFolder = FileService.copyFile(
          this.mockFolderResource,
          this.map,
          this.properties
        );

        // assertions
        assert.deepEqual(
          newFolder,
          this.mockFolder,
          'copyFile did not return correct value'
        );
        assert.equal(
          this.properties.remaining[0],
          this.mockFileResource.id,
          'properties.remaining did not get correct value added'
        );
        assert.equal(
          this.map[this.mockFileResource.id],
          newFolder.id,
          'folder did not get mapped correctly from source to destination'
        );

        // restore mocks
        stubInsert.restore();
      });
    });

    describe('when file is not a folder', function() {
      it('should copy a file', function() {
        // set up mocks
        const stubCopy = sinon.stub(GDriveService, 'copyFile');
        stubCopy.returns(this.mockFile);
        const request = {
          title: this.mockFileResource.title,
          parents: [
            {
              kind: 'drive#fileLink',
              id: 'newParentID'
            }
          ]
        };

        // set up actual
        const fileCopy = FileService.copyFile(
          this.mockFileResource,
          this.map,
          this.properties
        );

        // assertions
        assert.deepEqual(
          stubCopy.getCall(0).args[0],
          request,
          'GDriveService.copyFile called with wrong args'
        );
        assert.deepEqual(
          fileCopy,
          this.mockFile,
          'copyFile did not return correct value'
        );
        assert.equal(
          stubCopy.getCall(0).args[1],
          this.mockFileResource.id,
          'GDriveService.copyFile called with wrong fileID'
        );

        // restore mocks
        stubCopy.restore();
      });
    });
  });

  describe('processFileList()', function() {
    it('should return if !timer.canContinue()', function() {
      // set up mocks
      this.userProperties.getProperties().stop = 'true';
      this.timer.update(this.userProperties);
      const stubCopy = sinon.stub(FileService, 'copyFile');

      // set up actual
      FileService.processFileList(
        [1, 2, 3],
        'GTM-7',
        false,
        this.userProperties,
        this.timer,
        this.map,
        {},
        this.properties
      );

      // assertions
      assert(stubCopy.notCalled, 'FileService.copyFile was called');

      // reset mocks
      this.userProperties.getProperties().stop = false;
      stubCopy.restore();
    });
    it('should return if items.length == 0', function() {
      // set up mocks
      const stubCopy = sinon.stub(FileService, 'copyFile');

      // set up actual
      FileService.processFileList(
        [],
        'GTM-7',
        false,
        this.userProperties,
        this.timer,
        this.map,
        {},
        this.properties
      );

      // assertions
      assert(stubCopy.notCalled, 'FileService.copyFile was called');
      stubCopy.restore();
    });

    it('should call copyPermissions if copyPermissions is true and file is native GDrive mimeType', function() {
      // set up mocks
      const stubCopy = sinon
        .stub(FileService, 'copyFile')
        .returns(this.mockFile);
      const stubLog = sinon.stub(Util, 'log');
      const stubCopyPermissions = sinon.stub(FileService, 'copyPermissions');

      // run actual
      FileService.processFileList(
        [{ mimeType: 'application/vnd.google-apps.document' }],
        'GTM-7',
        true,
        this.userProperties,
        this.timer,
        this.map,
        {},
        this.properties
      );

      // assertions
      assert(
        stubCopyPermissions.calledOnce,
        'FileService.copyPermissions not called once. Expected 1, actual: ' +
          stubCopyPermissions.callCount
      );

      // restore mocks
      stubCopy.restore();
      stubLog.restore();
      stubCopyPermissions.restore();
    });

    it('should skip copyPermissions if file is not native GDrive mimeType', function() {
      // set up mocks
      const stubCopy = sinon
        .stub(FileService, 'copyFile')
        .returns(this.mockFile);
      const stubLog = sinon.stub(Util, 'log');
      const stubCopyPermissions = sinon.stub(FileService, 'copyPermissions');

      // run actual
      FileService.processFileList(
        [{ mimeType: 'application/json' }],
        'GTM-7',
        true,
        this.userProperties,
        this.timer,
        this.map,
        {},
        this.properties
      );

      // assertions
      assert(
        stubCopyPermissions.notCalled,
        'FileService.copyPermissions called. Expected 0, actual: ' +
          stubCopyPermissions.callCount
      );

      // restore mocks
      stubCopy.restore();
      stubLog.restore();
      stubCopyPermissions.restore();
    });

    it('should update timer after every file', function() {
      // set up mocks
      const stubCopy = sinon
        .stub(FileService, 'copyFile')
        .returns(this.mockFile);
      const stubLog = sinon.stub(Util, 'log');
      const stubCopyPermissions = sinon.stub(FileService, 'copyPermissions');
      const stubTimerUpdate = sinon.stub(this.timer, 'update');

      // run actual
      const items = [1, 2, 3];
      FileService.processFileList(
        items,
        'GTM-7',
        false,
        this.userProperties,
        this.timer,
        this.map,
        {},
        this.properties
      );

      // assertions
      assert(
        stubTimerUpdate.callCount,
        items.length,
        'timer.update called incorrect number of times'
      );

      // restore mocks
      stubCopy.restore();
      stubLog.restore();
      stubCopyPermissions.restore();
      stubTimerUpdate.restore();
    });

    it('should log errors if thrown during copy', function() {
      // set up mocks
      const errMsg = 'failed to copy file';
      const stubCopy = sinon.stub(FileService, 'copyFile').throws(errMsg);
      const stubLog = sinon.stub(Util, 'log');

      // run actual
      const items = [1, 2, 3];
      const itemsLength = items.length; // must set here because items is mutated in processFileList
      FileService.processFileList(
        items,
        'GTM-7',
        false,
        this.userProperties,
        this.timer,
        this.map,
        {},
        this.properties
      );

      // assertions
      assert(stubLog.called, 'Util.log not called');
      assert.equal(
        stubLog.callCount,
        itemsLength,
        'Util.log called incorrect number of times'
      );
      assert.equal(
        stubLog.getCall(0).args[1][0].indexOf('Error'),
        0,
        'Util.log not called with Error. Called with ' +
          stubLog.getCall(0).args[1][0]
      );

      // restore mocks
      stubCopy.restore();
      stubLog.restore();
    });
    it('should log copy details if successful', function() {
      // set up mocks
      const errMsg = 'failed to copy file';
      const stubCopy = sinon
        .stub(FileService, 'copyFile')
        .returns(this.mockFile);
      const stubLog = sinon.stub(Util, 'log');

      // run actual
      const items = [1, 2, 3];
      const itemsLength = items.length; // must set here because items is mutated in processFileList
      FileService.processFileList(
        items,
        'GTM-7',
        false,
        this.userProperties,
        this.timer,
        this.map,
        {},
        this.properties
      );

      // assertions
      assert(stubLog.called, 'Util.log not called.');
      assert.equal(stubLog.callCount, itemsLength, 'Util.log not called once');
      assert.equal(
        stubLog.getCall(0).args[1][0].indexOf('Copied'),
        0,
        'Util.log not called with "Copied". Called with ' +
          stubLog.getCall(0).args[1][0]
      );

      // restore mocks
      stubCopy.restore();
      stubLog.restore();
    });
  });

  describe('isDescendant()', function() {
    xit('should be tested', function() {});
  });
});
