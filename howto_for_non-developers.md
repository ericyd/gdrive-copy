How-To for non-developers
=========================

I wanted to create a guide that non-developers could use to deploy this code in their own web app, should they be so inclined.  Due to the fact that this app requires permissions to view and alter the contents of one's Google Drive, I can understand the desire to control this process and retain full editing rights over one's own Google Drive.

The intended audience for this document are those people who have familiarity with Google Drive and a moderate fluency with we browsers.  No modification of code is required to launch a web app using the code in this repository.

## Requirements

* Git
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

All uncompiled source code is located in the `src` folder.  The `application` directory houses the Google Apps Script files that actually access Google Drive.

## Step 5: Compile code

This app uses Gulp to build and bundle the app.  In the Gulpfile, you can set the `isProd` variable to `true` to enable minification of CSS, HTML, and JS files, 
or you can leave it `false` and things will not be compressed. 

Simply run
```
gulp build
```
and the files will be compiled into the `dist` directory.  Alternately, you can run 
```
gulp watch
```
before editing files, and the files will be compiled in realtime whenever changes are made.

## Step 6: Upload code

This app makes use of the free Google Apps Script service, so all you need to do is create a new Google Apps Script file from within your Google Drive, and upload the contents of the files in `dist` into the appropriate files.  You may need to create additional files via `File > New > Script | HTML file`.
   
## Step 7: Deploy as web app

Select `Publish > Deploy as Web App`.  Select the options you'd like, such as who can execute the and how the script will run.

Access the deployed web app with the link provided by Google Apps Script after you deploy the app.  This will be privately hosted through your own Google Drive, meaning any changes you have made will not be accessible to others unless you publish it to the Chrome Web Store. 