# How-To for non-developers

I wanted to create a guide that non-developers could use to deploy this code in
their own web app, should they be so inclined. Due to the fact that this app
requires permissions to view and alter the contents of one's Google Drive, I can
understand the desire to control this process and retain full editing rights
over one's own Google Drive.

The intended audience for this document are those people who have familiarity
with Google Drive and a moderate fluency with we browsers. No modification of
code is required to launch a web app using the code in this repository.

## Requirements

* Git
* NodeJS 4.x
* NPM (packaged with NodeJS)
* Google Drive account

## Step 1: Download code

```
git clone https://github.com/ericyd/gdrive-copy.git
```

## Step 2: Install the latest version of npm

```
npm install -g npm
```

## Step 3: Install dependencies

```
npm install
```

## Step 4: Edit code

All uncompiled source code is located in the `src` folder. The `application`
directory houses the Google Apps Script files that actually access Google Drive.

## Step 5: Compile code

This app uses Webpack and Gulp to build and bundle the app. There are a few ways
you can run it.

1. `npm run build:prod`: Run this to compile production ready files that can be
   updloaded to a Google Apps Script project. The output files will be placed in
   the `dist` directory
2. `npm run build:dev`: Run this to compile development files that can be opened
   from your local computer. This is useful for testing interface updates
   without having to upload the entire file to Google Apps Script. If using this
   option, you'll want to open the file `/dist/index.html` in your web browser
   after compiling.

## Step 6: Upload code

This app makes use of the free Google Apps Script service, so all you need to do
is create a new Google Apps Script file from within your Google Drive, and
upload the contents of the files in `dist` into the appropriate files. You may
need to create additional files via `File > New > Script | HTML file`.

## Step 7: Enable Drive API

1. Toolbar > Resources > Advanced Google Services
2. Enable the Drive API v2
3. Click the link that says "These services must also be enabled in the Google API Console"
4. This interface changes frequently so specific steps are not provided here. You basically want to find the place where you can enable the Drive API for that project. At that point it should work.

## Step 8: Deploy as web app

Select `Publish > Deploy as Web App`. Select the options you'd like, such as who
can execute the and how the script will run.

Access the deployed web app with the link provided by Google Apps Script after
you deploy the app. This will be privately hosted through your own Google Drive,
meaning any changes you have made will not be accessible to others unless you
publish it to the Chrome Web Store.


## Resources

* [Google Apps Script reference](https://developers.google.com/apps-script/reference/drive/)
* [Drive API reference](https://developers.google.com/drive/v2/reference/)
