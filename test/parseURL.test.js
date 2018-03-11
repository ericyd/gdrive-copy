global.URL = require('url').URL;
var assert = require('assert');
var { parseURL } = require('../src/util/helpers');

// Tests against all of these patterns
// https://drive.google.com/drive/folders/19pDrhPLxYRSEgmMDGMdeo1lFW3nT8v9-
// https://drive.google.com/drive/folders/19pDrhPLxYRSEgmMDGMdeo1lFW3nT8v9-/
// https://drive.google.com/drive/folders/19pDrhPLxYRSEgmMDGMdeo1lFW3nT8v9-?usp=sharing
// https://drive.google.com/open?id=19pDrhPLxYRSEgmMDGMdeo1lFW3nT8v9-
// https://drive.google.com/open?id=19pDrhPLxYRSEgmMDGMdeo1lFW3nT8v9-&usp=sharing
// https://drive.google.com/new/api/ + this.folderID + /folderview
describe('parseURL.js', function() {
  beforeEach(function() {
    this.folderID = '19pDrhPLxYRSEgmMDGMdeo1lFW3nT8v9-';
  });

  it('should return the input string if cannot be parsed', function() {
    const url = `https://drive.google.com/new/api/${this.folderID}/folderview`;
    assert.equal(parseURL(url), url);
  });

  it('should get ID from folder URL', function() {
    const url = `https://drive.google.com/drive/folders/${this.folderID}`;
    assert.equal(parseURL(url), this.folderID);
  });

  it('should remove trailing slashes if present', function() {
    const url = `https://drive.google.com/drive/folders/${this.folderID}/`;
    assert.equal(parseURL(url), this.folderID);
  });

  it('should get ID from `id` query param', function() {
    const url = `https://drive.google.com/open?id=${this.folderID}`;
    assert.equal(parseURL(url), this.folderID);
  });

  it('should trim any extraneous query params', function() {
    const url = `https://drive.google.com/open?id=${this.folderID}&usp=sharing`;
    assert.equal(parseURL(url), this.folderID);
  });

  it('should trim all query params when no `id` param present', function() {
    const url = `https://drive.google.com/drive/folders/${
      this.folderID
    }?usp=sharing`;
    assert.equal(parseURL(url), this.folderID);
  });
});
