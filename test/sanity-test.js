var assert = require('chai').assert;

describe('sanity check', function() {
    it('should be able to do basic math', function() {
        assert.equal(3, 1+2);
        assert.equal(6, 2*3);
    });

    it('should know the type of a string', function() {
        assert.equal('string', typeof 'this is a string');
    });
});