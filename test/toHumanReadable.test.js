import * as assert from 'assert';
import Logging from '../lib/Logging';

describe('bytesToHumanReadable', function() {
  it('should return bytes when less than 1 KB', () => {
    const number = 124;
    const actual = Logging.bytesToHumanReadable(number);
    assert.equal(actual, '124 bytes');
  });

  it('should return KB when 1KB <= size < 1MB', () => {
    const number = 12442;
    const actual = Logging.bytesToHumanReadable(number);
    assert.equal(actual, '12.15 KB');
  });

  it('should return MB when 1MB <= size <= 1GB', () => {
    const number = 12442873;
    const actual = Logging.bytesToHumanReadable(number);
    assert.equal(actual, '11.87 MB');
  });

  it('should return GB when 1GB <= size < 1TB', () => {
    const number = 12442125346;
    const actual = Logging.bytesToHumanReadable(number);
    assert.equal(actual, '11.59 GB');
  });

  it('should return TB when 1TB <= size < 1PB', () => {
    const number = 12442125346125;
    const actual = Logging.bytesToHumanReadable(number);
    assert.equal(actual, '11.32 TB');
  });

  // does google drive even support files this large? :P
  it('should return PB when 1PB <= size < 1EB', () => {
    const number = 12442125346125124;
    const actual = Logging.bytesToHumanReadable(number);
    assert.equal(actual, '11.05 PB');
  });
});
