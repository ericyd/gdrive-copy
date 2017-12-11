/**
 * Provide paths for use in other config files.
 *
 * This is mostly taken from the boilerplate file
 * in the hello-world app created by create-react-app
 */

const path = require('path');
const fs = require('fs');

// Make sure any symlinks in the project folder are resolved:
// https://github.com/facebookincubator/create-react-app/issues/637
const appDirectory = fs.realpathSync(process.cwd());
function resolveApp(relativePath) {
  return path.resolve(appDirectory, relativePath);
}

module.exports = {
  appBuild: resolveApp('dist'),
  appPublic: resolveApp('public'),
  appIndexJs: resolveApp('src/index.js'),
  appSrc: resolveApp('src')
};
