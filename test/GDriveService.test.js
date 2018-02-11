var GDriveService = require('../lib/GDriveService');
var assert = require('chai').assert;

describe('gdriveService', function() {
  it('should be importable', function() {
    var service = new GDriveService();
    assert.equal(service.ss, 'mySpreadsheetInstance');
  })
})