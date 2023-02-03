// Require modules
const fs = require('fs-extra')
const path = require('path')

// Remove the default Apps Script config file
// There is a modified one in the dist/ folder
fs.removeSync(path.resolve('appsscript.json'))

// Read the sample CLASP config file
const claspSampleJson = fs.readJsonSync('./.clasp.sample.json')

// Check if the CLASP project has been created
if (!fs.pathExistsSync('./.clasp.json')) {
  throw new Error('Error: Please create a new CLASP webapp project first.')
}

// Read the CLASP config file
const claspJson = fs.readJsonSync('./.clasp.json') 

// Merge the sample CLASP and the actual CLASP config file
// This will copy add other than default settings
const combinedJson = { ...claspSampleJson, ...claspJson }

// Define the dist/ folder as CLASP root directory
combinedJson.rootDir = 'dist/'

// Write the merged CLASP configuration to the config file
fs.writeJsonSync('.clasp.json', combinedJson, { spaces: 2 })
