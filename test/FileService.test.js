global.Utilities = require('./mocks/Utilities');
import FileService from '../lib/FileService';
import GDriveService from '../lib/GDriveService';
import Timer from '../lib/Timer';
import Properties from '../lib/Properties';
import Constants from '../lib/Constants';
import FeatureFlag from '../lib/FeatureFlag';
import Logging from '../lib/Logging';
const PropertiesService = require('./mocks/PropertiesService');
const assert = require('assert');
const fs = require('fs');
const sinon = require('sinon');

describe('FileService', function() {
  beforeEach(function() {
    this.gDriveService = new GDriveService();
    this.timer = new Timer();
    this.properties = new Properties(this.gDriveService);
    this.properties.map = {
      myParentID: 'newParentID'
    };
    this.fileService = new FileService(
      this.gDriveService,
      this.timer,
      this.properties
    );
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
          kind: 'drive#parentReference',
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
          kind: 'drive#parentReference',
          id: 'myParentID'
        }
      ],
      mimeType: 'application/vnd.google-apps.document'
    };
    this.userProperties = PropertiesService.getUserProperties();
  });

  describe('createLoggerSpreadsheet()', function() {
    it('should return newly created file resource', function() {
      const stub = sinon.stub(this.gDriveService, 'copyFile');
      const mockCopy = fs
        .readFileSync('test/mocks/copy_file_response_200.json')
        .toString();
      stub.returns(mockCopy);
      const expected = {
        today: new Date().getTime(),
        destID: '1234'
      };
      const copy = this.fileService.createLoggerSpreadsheet(
        expected.today,
        expected.destID
      );
      assert.equal(copy, mockCopy, 'returns wrong value');
      assert.equal(stub.getCall(0).args[1], Constants.BaseCopyLogId);
      const requestBody = {
        description: null,
        title: 'Copy Folder Log ' + expected.today,
        parents: [
          {
            kind: 'drive#parentReference',
            id: expected.destID
          }
        ]
      };
      assert.deepEqual(stub.getCall(0).args[0], requestBody);

      stub.restore();
    });

    it('should return error message if this.gDriveService.copyFile fails', function() {
      const stub = sinon.stub(this.gDriveService, 'copyFile');
      const errMsg = 'Error copying selected folder';
      stub.throws(new Error(errMsg));
      try {
        const copy = this.fileService.createLoggerSpreadsheet(1, 2);
        assert.equal(copy, errMsg, 'did not bubble up error');
      } catch (e) {
        assert.equal(e.message, errMsg, 'does not return error message');
      }

      stub.restore();
    });
  });

  describe('initializeDestinationFolder()', function() {
    it('should copy to options.srcFolderID when copyTo == same', function() {
      const stub = sinon.stub(this.gDriveService, 'insertFolder');
      const spy = sinon.spy(this.fileService, 'copyPermissions');
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
            kind: 'drive#parentReference',
            id: options.srcParentID
          }
        ],
        mimeType: 'application/vnd.google-apps.folder'
      };
      const destFolder = this.fileService.initializeDestinationFolder(
        options,
        today
      );
      assert.deepEqual(
        stub.getCall(0).args[0],
        requestBody,
        'this.gDriveService.insertFolder called with wrong args'
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
      const stubInsert = sinon.stub(this.gDriveService, 'insertFolder');
      const stubRoot = sinon.stub(this.gDriveService, 'getRootID');
      const spy = sinon.spy(this.fileService, 'copyPermissions');
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
            kind: 'drive#parentReference',
            id: expectedRootID
          }
        ],
        mimeType: 'application/vnd.google-apps.folder'
      };
      const destFolder = this.fileService.initializeDestinationFolder(
        options,
        today
      );

      // assertions
      assert.deepEqual(
        stubInsert.getCall(0).args[0],
        requestBody,
        'this.gDriveService.insertFolder called with wrong args'
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
      const stubInsert = sinon.stub(this.gDriveService, 'insertFolder');
      const stubDescendant = sinon.stub(FileService, 'isDescendant');
      const spy = sinon.spy(this.fileService, 'copyPermissions');
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
            kind: 'drive#parentReference',
            id: options.destParentID
          }
        ],
        mimeType: 'application/vnd.google-apps.folder'
      };
      const destFolder = this.fileService.initializeDestinationFolder(
        options,
        today
      );

      // assertions
      assert.deepEqual(
        stubInsert.getCall(0).args[0],
        requestBody,
        'this.gDriveService.insertFolder called with wrong args'
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
      const stubInsert = sinon.stub(this.gDriveService, 'insertFolder');
      const stubDescendant = sinon.stub(FileService, 'isDescendant');
      const spy = sinon.spy(this.fileService, 'copyPermissions');
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
      const destFolder = this.fileService.initializeDestinationFolder(
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
      const stubInsert = sinon.stub(this.gDriveService, 'insertFolder');
      const stubCopyPermissions = sinon.stub(
        this.fileService,
        'copyPermissions'
      );
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
      const destFolder = this.fileService.initializeDestinationFolder(
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
              kind: 'drive#parentReference',
              id: 'newParentID'
            }
          ],
          mimeType: 'application/vnd.google-apps.folder'
        };
        const stubInsert = sinon.stub(this.gDriveService, 'insertFolder');
        stubInsert.returns(this.mockFolder);

        // set up actual
        const newFolder = this.fileService.copyFile(this.mockFolderResource);

        // assertions
        assert.deepEqual(
          stubInsert.getCall(0).args[0],
          request,
          'this.gDriveService.insertFolder called with wrong args'
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
        const stubInsert = sinon.stub(this.gDriveService, 'insertFolder');
        stubInsert.returns(this.mockFolder);

        // set up actual
        const newFolder = this.fileService.copyFile(this.mockFolderResource);

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
          this.properties.map[this.mockFileResource.id],
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
        const stubCopy = sinon.stub(this.gDriveService, 'copyFile');
        stubCopy.returns(this.mockFile);
        const request = {
          description: null,
          title: this.mockFileResource.title,
          parents: [
            {
              kind: 'drive#parentReference',
              id: 'newParentID'
            }
          ]
        };

        // set up actual
        const fileCopy = this.fileService.copyFile(this.mockFileResource);

        // assertions
        assert.deepEqual(
          stubCopy.getCall(0).args[0],
          request,
          'this.gDriveService.copyFile called with wrong args'
        );
        assert.deepEqual(
          fileCopy,
          this.mockFile,
          'copyFile did not return correct value'
        );
        assert.equal(
          stubCopy.getCall(0).args[1],
          this.mockFileResource.id,
          'this.gDriveService.copyFile called with wrong fileID'
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
      const stubCopy = sinon.stub(this.fileService, 'copyFile');

      // set up actual
      this.fileService.processFileList([1, 2, 3], this.userProperties, {});

      // assertions
      assert(stubCopy.notCalled, 'this.fileService.copyFile was called');

      // reset mocks
      this.userProperties.getProperties().stop = false;
      stubCopy.restore();
    });

    it('should return if items.length == 0', function() {
      // set up mocks
      const stubCopy = sinon.stub(this.fileService, 'copyFile');

      // set up actual
      this.fileService.processFileList([], this.userProperties, {});

      // assertions
      assert(stubCopy.notCalled, 'this.fileService.copyFile was called');
      stubCopy.restore();
    });

    it('should call copyPermissions if copyPermissions is true and file is native GDrive mimeType', function() {
      // set up mocks
      const stubCopy = sinon
        .stub(this.fileService, 'copyFile')
        .returns(this.mockFile);
      const stubLog = sinon.stub(Logging, 'log');
      const stubCopyPermissions = sinon.stub(
        this.fileService,
        'copyPermissions'
      );

      // run actual
      this.properties.copyPermissions = true;
      this.fileService.processFileList(
        [{ mimeType: 'application/vnd.google-apps.document' }],
        this.userProperties,
        {}
      );

      // assertions
      assert(
        stubCopyPermissions.calledOnce,
        'this.fileService.copyPermissions not called once. Expected 1, actual: ' +
          stubCopyPermissions.callCount
      );

      // restore mocks
      stubCopy.restore();
      stubLog.restore();
      stubCopyPermissions.restore();
      this.properties.copyPermissions = false;
    });

    it('should skip copyPermissions if file is not native GDrive mimeType', function() {
      // set up mocks
      const stubCopy = sinon
        .stub(this.fileService, 'copyFile')
        .returns(this.mockFile);
      const stubLog = sinon.stub(Logging, 'log');
      const stubCopyPermissions = sinon.stub(
        this.fileService,
        'copyPermissions'
      );

      // run actual
      this.properties.copyPermissions = true;
      this.fileService.processFileList(
        [{ mimeType: 'application/json' }],
        this.userProperties,
        {}
      );

      // assertions
      assert(
        stubCopyPermissions.notCalled,
        'this.fileService.copyPermissions called. Expected 0, actual: ' +
          stubCopyPermissions.callCount
      );

      // restore mocks
      stubCopy.restore();
      stubLog.restore();
      stubCopyPermissions.restore();
      this.properties.copyPermissions = false;
    });

    it('should update timer after every file', function() {
      // set up mocks
      const stubCopy = sinon
        .stub(this.fileService, 'copyFile')
        .returns(this.mockFile);
      const stubLog = sinon.stub(Logging, 'log');
      const stubCopyPermissions = sinon.stub(
        this.fileService,
        'copyPermissions'
      );
      const stubTimerUpdate = sinon.stub(this.timer, 'update');

      // run actual
      const items = [1, 2, 3];
      this.fileService.processFileList(items, this.userProperties, {});

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

    it('should push failed item to properties.retryQueue', function() {
      const errMsg = 'failed to copy file';
      const stubCopy = sinon
        .stub(this.fileService, 'copyFile')
        .throws(new Error(errMsg));

      // run actual
      const previouslyRetriedFile = Object.assign({}, this.mockFile, {
        numberOfAttempts: 1
      });
      const items = [this.mockFile, previouslyRetriedFile, this.mockFile];
      const itemsLength = items.length; // must set here because items is mutated in processFileList
      this.fileService.processFileList(items, this.userProperties, {});

      assert.equal(
        this.properties.retryQueue.length,
        itemsLength,
        "properties.retryQueue doesn't contain enough items"
      );
      assert.equal(this.properties.retryQueue[0].id, this.mockFile.id);
      assert.equal(this.properties.retryQueue[0].title, this.mockFile.title);
      assert.equal(this.properties.retryQueue[0].numberOfAttempts, 1);
      assert.equal(this.properties.retryQueue[1].numberOfAttempts, 2);
      assert.equal(this.properties.retryQueue[1].error.message, errMsg);

      // restore mocks
      stubCopy.restore();
    });

    it('should treat retryQueue as FIFO', function() {
      const errMsg = 'failed to copy file';
      const stubCopy = sinon
        .stub(this.fileService, 'copyFile')
        .throws(new Error(errMsg));

      // run actual
      const items = [{ id: 1 }, { id: 2 }, { id: 3 }];
      const itemsLength = items.length; // must set here because items is mutated in processFileList
      this.fileService.processFileList(items, this.userProperties, {});

      assert.equal(
        this.properties.retryQueue.length,
        itemsLength,
        "properties.retryQueue doesn't contain enough items"
      );
      assert.equal(this.properties.retryQueue[0].id, 1);
      assert.equal(this.properties.retryQueue[1].id, 2);
      assert.equal(this.properties.retryQueue[2].id, 3);

      // restore mocks
      stubCopy.restore();
    });

    it('should log errors if item has been retried too many tiems', function() {
      // set up mocks
      const errMsg = 'failed to copy file';
      const stubCopy = sinon
        .stub(this.fileService, 'copyFile')
        .throws(new Error(errMsg));
      const stubLog = sinon.stub(Logging, 'logCopyError');

      // run actual
      const previouslyRetriedFile = Object.assign({}, this.mockFile, {
        numberOfAttempts: this.fileService.maxNumberOfAttempts + 1,
        error: new Error(errMsg)
      });
      const items = [previouslyRetriedFile, this.mockFile, this.mockFile];
      this.fileService.processFileList(items, this.userProperties, {
        spreadsheetStub: true
      });

      // assertions
      assert(stubLog.called, 'Logging.logCopyError not called');
      assert.equal(
        stubLog.callCount,
        1,
        'Logging.log called incorrect number of times'
      );
      assert(
        stubLog.getCall(0).args[0].spreadsheetStub,
        'Logging.logCopyError not called with spreadsheetStub'
      );
      assert.equal(
        stubLog.getCall(0).args[1].message,
        errMsg,
        'Error not passed to Logging.logCopyError correctly'
      );
      assert.equal(stubLog.getCall(0).args[2].id, previouslyRetriedFile.id);
      assert.equal(
        stubLog.getCall(0).args[2].numberOfAttempts,
        previouslyRetriedFile.numberOfAttempts
      );

      // restore mocks
      stubCopy.restore();
      stubLog.restore();
    });

    it('should log copy details if successful', function() {
      // set up mocks
      const errMsg = 'failed to copy file';
      const stubCopy = sinon
        .stub(this.fileService, 'copyFile')
        .returns(this.mockFile);
      const stubLog = sinon.stub(Logging, 'logCopySuccess');

      // run actual
      const items = [{ id: 1 }, { id: 2 }, { id: 3 }];
      const itemsLength = items.length; // must set here because items is mutated in processFileList
      this.fileService.processFileList(items, this.userProperties, {
        spreadsheetStub: true
      });

      // assertions
      assert(stubLog.called, 'Logging.logCopySuccess not called.');
      assert.equal(
        stubLog.callCount,
        itemsLength,
        `Logging.logCopySuccess not called ${itemsLength} times`
      );
      assert.equal(
        stubLog.getCall(0).args[0].spreadsheetStub,
        true,
        'Logging.logCopySuccess not called with "spreadsheetStub". Called with ' +
          stubLog.getCall(0).args[0]
      );
      assert.deepEqual(
        stubLog.getCall(0).args[1],
        this.mockFile,
        'Logging.logCopySuccess not called with "this.mockFile". Called with ' +
          stubLog.getCall(0).args[1]
      );

      // restore mocks
      stubCopy.restore();
      stubLog.restore();
    });

    [[true, 'not ', 3], [false, '', 4]].forEach(
      ([featureFlag, not, numberCopies]) => {
        describe(`when FeatureFlag.SKIP_DUPLICATE_ID is ${featureFlag}`, function() {
          it(`should ${not}copy the same ID twice`, function() {
            // set up mocks
            FeatureFlag.SKIP_DUPLICATE_ID = featureFlag;
            const stubCopy = sinon
              .stub(this.fileService, 'copyFile')
              .returns(this.mockFile);
            Logging.logCopySuccess = sinon.stub();

            // run actual
            const items = [{ id: 1 }, { id: 2 }, { id: 1 }, { id: 3 }];
            this.fileService.processFileList(items, this.userProperties, {
              spreadsheetStub: true
            });

            // assertions
            assert.equal(
              stubCopy.callCount,
              numberCopies,
              `stubCopy not called ${numberCopies} times`
            );

            // restore mocks
            stubCopy.restore();
          });
        });
      }
    );
  });

  describe('isDescendant()', function() {
    xit('should be tested', function() {});
  });
});
