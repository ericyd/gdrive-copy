// enforce prettier
const fs = require('fs');
const path = require('path');
const prettier = require('prettier');
const assert = require('assert');

const dirs = ['lib', 'src', 'src/components', 'src/views', 'src/util'];

describe('File formatting', function() {
  dirs.forEach(dir => {
    fs.readdir(dir, (err, files) => {
      if (err) throw err;
      files.forEach(file => {
        it(`file ${file} should be formatted`, function() {
          fs.readFile(path.join(dir, file), (err, data) => {
            if (err) throw err;
            if (!prettier.check(file.toString())) {
              assert(false, `file ${path.join(dir, file)} not formatted`);
            }
          });
        });
      });
    });
  });
});
