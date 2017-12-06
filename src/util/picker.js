/*
Many, many thanks to [Jean-Pierre Verhulst](https://plus.google.com/+JeanPierreVerhulst/posts) 
for providing the working backbone of this script
*/

// Declare variables
export class Picker {
  constructor(cb) {
    this.pickerCallback = cb;
    this.onApiLoad = this.onApiLoad.bind(this);
    this.createPicker = this.createPicker.bind(this);
    this.showPicker = this.showPicker.bind(this);
  }
  onApiLoad() {
    var _this = this;
    gapi.load('picker', {
      callback: function() {
        google.script.run
          .withSuccessHandler(_this.createPicker)
          .withFailureHandler(function(err) {
            return 'Error getting OAuth token for Google Picker.  Please manually input folder URL';
          })
          .getOAuthToken();
      }
    });
  }

  createPicker(token) {
    if (token) {
      var foldersView = new google.picker.DocsView()
        .setIncludeFolders(true)
        .setMimeTypes('application/vnd.google-apps.folder')
        .setSelectFolderEnabled(true);

      this.pickerBuilder = new google.picker.PickerBuilder()
        .addView(foldersView)
        .hideTitleBar()
        .setOAuthToken(token)
        .setMaxItems(1)
        .setCallback(this.pickerCallback)
        .setTitle('Select a folder to copy')
        .setOrigin('https://script.google.com')
        .build();
    } else {
      // todo: handle errors
    }
  }

  // Allows method binding from external scripts, e.g. init.js
  showPicker() {
    return this.pickerBuilder.setVisible(true);
  }
}

// vanillaJS implementation of $.getScript()
//  http://stackoverflow.com/questions/16839698/jquery-getscript-alternative-in-native-javascript
export function getScript(source, callback) {
  var script = document.createElement('script');
  var prior = document.getElementsByTagName('script')[0];
  script.async = 1;
  prior.parentNode.insertBefore(script, prior);

  script.onload = script.onreadystatechange = function(_, isAbort) {
    if (
      isAbort ||
      !script.readyState ||
      /loaded|complete/.test(script.readyState)
    ) {
      script.onload = script.onreadystatechange = null;
      script = undefined;

      if (!isAbort) {
        if (callback) callback();
      }
    }
  };

  script.src = source;
}
