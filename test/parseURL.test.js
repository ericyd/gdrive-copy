'use strict';
var assert = require('assert');
var { parseURL } = require('../src/util/helpers');

// TODO: WHY ARE THESE TESTS NOT USING ACTUAL FOLDER URLS???????!?!?!?!?!?!
describe('parseURL.js', function() {
  it('should return the input string if it does not contain the search terms', function() {
    const url = 'http://www.ericyd.com/resume';
    assert.equal(url, parseURL(url));
  });

  it('should trim any characters at or after the first ampersand in the url', function() {
    const url = 'http://www.ericyd.com/resume?name=eric&age=27';
    assert.equal(url.slice(0, url.indexOf('&')), parseURL(url));
  });

  it('should trim any characters preceding the substring "id="', function() {
    const url = 'http://www.ericyd.com/resume?id=8448449448&age=27';
    let expected = url.slice(url.indexOf('id=') + 3);
    expected = expected.slice(0, expected.indexOf('&'));
    assert.equal(expected, parseURL(url));
  });

  it('should trim any characters preceding the substring "folders"', function() {
    const url =
      'http://www.ericyd.com/resume/folders/8448449448/?name=eric&age=27';
    const searchString = 'folders';
    const offset = url.indexOf(searchString) + searchString.length + 1; // +1 accounts for forward slash in url
    let expected = url.slice(offset);
    expected = expected.slice(0, expected.indexOf('&'));
    assert.equal(expected, parseURL(url));
  });

  it('should trim query params', function() {
    // Folders are coming in like this: FOLDERID-13123123?usp=sharing
    // Need to eliminate the query params
    // But, also need to accept "sharing links"
    assert.fail("need to write test")
  })
});
