'use strict';
const es = require('event-stream');;
const gutil = require('gulp-util');
const Hogan = require('hogan.js');
const path = require('path');
const fs = require('fs');

module.exports = function(data, options, extension) {
  data = data || {};
  extension = extension || '.js';
  return es.map(function (file, cb) {
    const compiled = Hogan.compile(file.contents.toString(), options);
    const partialTemplates = getPartials(compiled, path.dirname(file.path), path.extname(file.path), data, options);
    
    file.contents = new Buffer( compiled.render(data, partialTemplates) );
    file.path = gutil.replaceExtension(file.path, extension);
    cb(null,file);
  });
};


const getPartials = (compiled, dir, ext, data, options) => {
    let currentPartials = {},
        partialTemplates = {},
        partialPath = '',
        compiledPartial;
    
    Object.keys(compiled.partials).forEach((tag) => {
        // find the path of the partial
        partialPath = path.format({
            'dir': dir,
            'base': compiled.partials[tag].name + ext
        });
        
        
        // read and compile the files contents
        compiledPartial = Hogan.compile(fs.readFileSync(partialPath).toString(), options);
        
        
        // if partials exist within the compiled tempalte, then 
        if (Object.keys(compiledPartial.partials).length !== 0) {
            currentPartials = getPartials(compiledPartial, dir, ext, data, options);
        }
        
        
        // Assign the contents of the partial to a key of the same name
        partialTemplates[compiled.partials[tag].name] = compiledPartial.render(data, currentPartials);
    });
    
    return partialTemplates;
}
