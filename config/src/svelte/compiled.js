!(function(modules) {
  function __webpack_require__(moduleId) {
    if (installedModules[moduleId]) return installedModules[moduleId].exports;
    var module = (installedModules[moduleId] = {
      i: moduleId,
      l: !1,
      exports: {}
    });
    return (
      modules[moduleId].call(
        module.exports,
        module,
        module.exports,
        __webpack_require__
      ),
      (module.l = !0),
      module.exports
    );
  }
  var installedModules = {};
  (__webpack_require__.m = modules),
    (__webpack_require__.c = installedModules),
    (__webpack_require__.i = function(value) {
      return value;
    }),
    (__webpack_require__.d = function(exports, name, getter) {
      __webpack_require__.o(exports, name) ||
        Object.defineProperty(exports, name, {
          configurable: !1,
          enumerable: !0,
          get: getter
        });
    }),
    (__webpack_require__.n = function(module) {
      var getter =
        module && module.__esModule
          ? function() {
              return module.default;
            }
          : function() {
              return module;
            };
      return __webpack_require__.d(getter, 'a', getter), getter;
    }),
    (__webpack_require__.o = function(object, property) {
      return Object.prototype.hasOwnProperty.call(object, property);
    }),
    (__webpack_require__.p = ''),
    __webpack_require__((__webpack_require__.s = 1));
})([
  function(module, exports) {
    throw new Error(
      'Module build failed: Error: Couldn\'t find preset "react" relative to directory "/home/eric/repos/gdrive-copy/src"\n    at /home/eric/repos/gdrive-copy/node_modules/babel-core/lib/transformation/file/options/option-manager.js:293:19\n    at Array.map (native)\n    at OptionManager.resolvePresets (/home/eric/repos/gdrive-copy/node_modules/babel-core/lib/transformation/file/options/option-manager.js:275:20)\n    at OptionManager.mergePresets (/home/eric/repos/gdrive-copy/node_modules/babel-core/lib/transformation/file/options/option-manager.js:264:10)\n    at OptionManager.mergeOptions (/home/eric/repos/gdrive-copy/node_modules/babel-core/lib/transformation/file/options/option-manager.js:249:14)\n    at OptionManager.init (/home/eric/repos/gdrive-copy/node_modules/babel-core/lib/transformation/file/options/option-manager.js:368:12)\n    at File.initOptions (/home/eric/repos/gdrive-copy/node_modules/babel-core/lib/transformation/file/index.js:212:65)\n    at new File (/home/eric/repos/gdrive-copy/node_modules/babel-core/lib/transformation/file/index.js:135:24)\n    at Pipeline.transform (/home/eric/repos/gdrive-copy/node_modules/babel-core/lib/transformation/pipeline.js:46:16)\n    at transpile (/home/eric/repos/gdrive-copy/node_modules/babel-loader/lib/index.js:48:20)\n    at Object.module.exports (/home/eric/repos/gdrive-copy/node_modules/babel-loader/lib/index.js:163:20)'
    );
  },
  function(module, exports, __webpack_require__) {
    module.exports = __webpack_require__(0);
  }
]);
