import Drive from './mocks/Drive';
global.Drive = Drive;
import { getMetadata } from '../lib/public';
import assert from 'assert';
import { stub } from 'sinon';
import GDriveService from '../lib/GDriveService';
import * as fs from 'fs';

describe('getMetadata', () => {
  beforeEach(function() {
    this.gDriveService = new GDriveService();
  });
  it('returns file resource', function() {
    const getFileStub = stub(Drive.Files, 'get');
    const mockCopy = JSON.parse(
      fs.readFileSync('test/mocks/copy_file_response_200.json').toString()
    );
    const mockId = mockCopy.id;
    getFileStub.withArgs(mockId).returns(mockCopy);
    const actual = getMetadata(mockId, 'url');
    assert.deepEqual(actual, mockCopy, 'actual and mockCopy do not match');
    getFileStub.restore();
  });

  it('returns URL in error message', function() {
    const getFileStub = stub(Drive.Files, 'get');
    const mockId = '123';
    const url = 'https://drive.google.com/?id=test';
    const errorMessage = `Unable to find a folder with the supplied URL. You submitted ${url}. Please verify that you are using a valid folder URL and try again.`;
    getFileStub.throws(errorMessage);
    try {
      const actual = getMetadata(mockId, url);
      assert.equal(actual, errorMessage, 'did not bubble up error');
    } catch (e) {
      assert.equal(e.message, errorMessage, 'does not throw correct error');
    }
    getFileStub.restore();
  });
});
