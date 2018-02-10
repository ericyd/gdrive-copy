# Google Drive Copy Folder

This is a Google Drive Web app hosted at the
[Chrome Web Store](https://chrome.google.com/webstore/detail/copy-folder/kfbicpdhiofpicipfggljdhjokjblnhl).
This app will recursively copy all contents and sub-folders within a Google
Drive folder. As long as you have viewing rights on a folder, you can copy it in
its entirety to your own Google Drive. The folder will be placed in your Google
Drive, and you can move it from there.

This project is not associated with Google in any way.

To launch app: <https://script.google.com/macros/s/AKfycbxbGNGajrxv-HbX2sVY2OTu7yj9VvxlOMOeQblZFuq7rYm7uyo/exec>

## Unable to sign in

If you are having issues signing in to the app, please try one of these options:
1. Use a different browser
2. Use an incognito/private window
3. Clear your cookies and cache (Ctrl+Shift+Delete is a shortcut on Windows)

## Usage

1. Select your folder with the Google Picker, or paste a folder URL with Ctrl-C
2. Choose a name for the new folder
3. Select copying options
4. Click "Copy Folder". When the copy begins, you will be alerted that you can
   close the window.

In addition, the app user will become the owner of the new folder and all
sub-folders and contents. This makes it especially handy for making a new copy
of shared information when someone leaves an organization.

## Privacy

Please see the
[Privacy Policy](https://github.com/ericyd/gdrive-copy/blob/master/PRIVACY_POLICY.md).

This app does not store any data relating to your account or Google Drive
contents.

## Notes

* This app performs best in Google Chrome or Chromium.
* This app requires several permissions to run. The app needs to run offline so
  that you can close the window while the copying completes. You can view the
  source code on the Github page, listed below, to review the app and launch
  your own copy of the app if security is a concern.
* If you'd like to copy sharing permissions from the original folder, check the
  appropriate box on the Options page
* By default the folder will copy to the same location as the original folder.
  You can copy it to the root directory by selecting "Root directory" under
  "Copy folder to"

## Bugs? Questions?

Please open an [issue on Github](https://github.com/ericyd/gdrive-copy/issues).

# Project maintenance

This project is not updated very frequently. I will try to keep it
updated to remain functional with any changes to the Drive API, but I have a
limited amount of time and other projects which I would like to focus on.

I welcome contributions and I will gladly review any pull requests.

If you are inclined to contribute to this project, here are a few areas which
need attention:

1. Fix the long-standing bug where the copying will fail to resume, presumably
   due to exceeding a Google Apps quota.
2. Add a procedure to catch and re-process files that error out during the
   copying process. Currently they are just logged and then ignored, but ideally
   they would be tried again.
3. Make the account switcher and login process more robust to ensure that people
   don't get locked out of the app, or are forced to use it with only one
   account
4. Add integration for Google Drive so that this script could be added into the
   context menu for Google Drive folders and accessed directly from Drive,
   rather than having to navigate to a separate app
5. General codebase cleanup and refactoring
