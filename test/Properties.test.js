var Properties = require('../lib/Properties');
var PropertiesService = require('./mocks/PropertiesService');
var assert = require('assert');

describe('Properties', function() {
  it('should be importable', function() {
    var service = new Properties(PropertiesService);
    assert(true);
  });
});
