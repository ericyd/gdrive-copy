// enforce prettier
const fs = require('fs');
const path = require('path');
const prettier = require('prettier');
const assert = require('assert');

const dirs = [
  'lib',
  'src',
  path.join('src', 'components'),
  path.join('src', 'views'),
  path.join('src', 'util')
];

describe('File formatting', function() {
  dirs.forEach(dir => {
    const files = fs.readdirSync(dir);
    files.forEach(file => {
      if (fs.statSync(path.join(dir, file)).isDirectory()) return;
      it(`files ${file} should be formatted`, function() {
        const data = fs.readFileSync(path.join(dir, file));
        // prettier.check appears to only check the properties passed to it
        // TODO: make this more accurate for formatting I'd like to enforce
        if (
          prettier.check(data.toString(), {
            useTabs: false,
            semi: true,
            printWidth: true
          })
        ) {
          assert(
            false,
            `file ${path.join(
              dir,
              file
            )} not formatted. Please run: "npm run prettier"`
          );
        }
      });
    });
  });
});
