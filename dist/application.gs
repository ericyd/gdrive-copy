'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var Timer = (function () {
    function Timer() {
        this.START_TIME = new Date().getTime();
        this.runtime = 0;
        this.timeIsUp = false;
        return this;
    }
    Timer.prototype.update = function () {
        this.runtime = Timer.now() - this.START_TIME;
        this.timeIsUp = this.runtime >= Timer.MAX_RUNTIME;
    };
    Timer.prototype.canContinue = function () {
        return !this.timeIsUp;
    };
    Timer.prototype.calculateTriggerDuration = function (properties) {
        return properties.checkMaxRuntime()
            ? Timer.ONE_DAY
            : Timer.SIX_MINUTES - this.runtime;
    };
    Timer.now = function () {
        return new Date().getTime();
    };
    Timer.MAX_RUNTIME_PER_DAY = 88 * 1000 * 60;
    Timer.MAX_RUNTIME = 4.7 * 1000 * 60;
    Timer.ONE_DAY = 24 * 60 * 60 * 1000;
    Timer.SIX_MINUTES = 6.2 * 1000 * 60;
    return Timer;
}());

var ErrorMessages = (function () {
    function ErrorMessages() {
    }
    ErrorMessages.DataFilesNotFound = 'Could not find the necessary data files in the selected folder. Please ensure that you selected the in-progress copy and not the original folder.';
    ErrorMessages.Descendant = 'Cannot select destination folder that exists within the source folder';
    ErrorMessages.FailedSaveProperties = 'Failed to save properties. This could affect script performance and may require restarting the copy. Error Message: ';
    ErrorMessages.FailedSetLeftovers = 'Failed to set leftover file list. Error Message: ';
    ErrorMessages.LoadingProp = function (key, value) {
        return "Error loading property " + key + " to properties object. Attempted to save: " + value;
    };
    ErrorMessages.NoPropertiesDocumentId = 'Could not determine properties document ID. Please try running the script again';
    ErrorMessages.NotFound = function (url) {
        return "Unable to find a folder with the supplied URL. You submitted " + url + ". Please verify that you are using a valid folder URL and try again.";
    };
    ErrorMessages.OutOfSpace = 'You have run out of space in your Drive! You should delete some files and then come back and use the "Resume" feature to restart your copy.';
    ErrorMessages.ParseError = "Unable to parse the properties document. This is likely a bug, but it is worth trying one more time to make sure it wasn't a fluke.";
    ErrorMessages.ParseErrorRemaining = 'properties.remaining is not parsed correctly';
    ErrorMessages.Restarting = 'Error restarting script, trying again...';
    ErrorMessages.SerializeError = 'Failed to serialize script properties. This is a critical failure. Please start your copy again.';
    ErrorMessages.SettingTrigger = 'Error setting trigger.  There has been a server error with Google Apps Script. To successfully finish copying, please refresh the app and click "Resume Copying" and follow the instructions on the page.';
    ErrorMessages.SpreadsheetTooLarge = 'The spreadsheet is too large to continue logging, but the service will continue to run in the background';
    ErrorMessages.SpreadsheetNotFound = 'Cannot locate spreadsheet. Please try again.';
    ErrorMessages.WillDuplicateOnResume = 'HEADS UP! Your most recently copied files WILL BE DUPLICATED if you resume. To avoid duplicating, you will need to restart your copy from the beginning';
    return ErrorMessages;
}());

var Logging = (function () {
    function Logging() {
    }
    Logging._log = function (ss, values) {
        if (ss === void 0) { ss = Logging.getDefaultSheet(); }
        values = values.map(function (cell) {
            if (cell && typeof cell == 'string') {
                return cell.slice(0, 4999);
            }
            return '';
        });
        var lastRow = ss.getLastRow();
        var startRow = lastRow + 1;
        var startColumn = 1;
        var numRows = 1;
        var numColumns = values.length;
        try {
            ss
                .insertRowAfter(lastRow)
                .getRange(startRow, startColumn, numRows, numColumns)
                .setValues([values]);
        }
        catch (e) {
            ss.getRange(lastRow, startColumn, numRows, 1).setValues([
                [ErrorMessages.SpreadsheetTooLarge]
            ]);
        }
    };
    Logging.getDefaultSheet = function () {
        return SpreadsheetApp.openById(PropertiesService.getUserProperties().getProperty('spreadsheetId')).getSheetByName('Log');
    };
    Logging.log = function (_a) {
        var _b = _a.ss, ss = _b === void 0 ? Logging.getDefaultSheet() : _b, _c = _a.status, status = _c === void 0 ? '' : _c, _d = _a.title, title = _d === void 0 ? '' : _d, _e = _a.id, id = _e === void 0 ? '' : _e, _f = _a.timeZone, timeZone = _f === void 0 ? 'GMT-7' : _f, _g = _a.parentId, parentId = _g === void 0 ? '' : _g, _h = _a.fileSize, fileSize = _h === void 0 ? 0 : _h;
        var columns = {
            status: 0,
            title: 1,
            link: 2,
            id: 3,
            timeCompleted: 4,
            parentFolderLink: 5,
            fileSize: 6
        };
        var values = Object.keys(columns).map(function (_) { return ''; });
        values[columns.status] = status;
        values[columns.title] = title;
        values[columns.link] = FileService.getFileLinkForSheet(id, title);
        values[columns.id] = id;
        values[columns.timeCompleted] = Utilities.formatDate(new Date(), timeZone, 'MM-dd-yy hh:mm:ss aaa');
        values[columns.parentFolderLink] =
            parentId === ''
                ? parentId
                : FileService.getFileLinkForSheet(parentId, '');
        values[columns.fileSize] = Logging.bytesToHumanReadable(fileSize);
        Logging._log(ss, values);
    };
    Logging.logCopyError = function (ss, error, item, timeZone) {
        var parentId = item.parents && item.parents[0] ? item.parents[0].id : null;
        Logging.log({
            ss: ss,
            status: Util.composeErrorMsg(error),
            title: item.title,
            id: item.id,
            timeZone: timeZone,
            parentId: parentId
        });
    };
    Logging.logCopySuccess = function (ss, item, timeZone) {
        var parentId = item.parents && item.parents[0] ? item.parents[0].id : null;
        Logging.log({
            ss: ss,
            status: 'Copied',
            title: item.title,
            id: item.id,
            timeZone: timeZone,
            parentId: parentId,
            fileSize: item.fileSize
        });
    };
    Logging.bytesToHumanReadable = function (bytes, decimals) {
        if (bytes === void 0) { bytes = 0; }
        if (decimals === void 0) { decimals = 2; }
        if (bytes === 0 || bytes === null || bytes === undefined)
            return '';
        var unit = 1024;
        var abbreviations = [
            'bytes',
            'KB',
            'MB',
            'GB',
            'TB',
            'PB',
            'EB',
            'ZB',
            'YB'
        ];
        var size = Math.floor(Math.log(bytes) / Math.log(unit));
        return (parseFloat((bytes / Math.pow(unit, size)).toFixed(decimals)) +
            ' ' +
            abbreviations[size]);
    };
    return Logging;
}());

var TriggerService = (function () {
    function TriggerService() {
    }
    TriggerService.createTrigger = function (duration) {
        duration = duration || Timer.SIX_MINUTES;
        var trigger = ScriptApp.newTrigger('copy')
            .timeBased()
            .after(duration)
            .create();
        if (trigger) {
            PropertiesService.getUserProperties().setProperty('triggerId', trigger.getUniqueId());
        }
    };
    TriggerService.deleteTrigger = function (triggerId) {
        if (triggerId !== undefined && triggerId !== null) {
            try {
                var allTriggers = ScriptApp.getProjectTriggers();
                for (var i = 0; i < allTriggers.length; i++) {
                    if (allTriggers[i].getUniqueId() == triggerId) {
                        ScriptApp.deleteTrigger(allTriggers[i]);
                        break;
                    }
                }
            }
            catch (e) {
                Logging.log({ status: Util.composeErrorMsg(e) });
            }
        }
    };
    return TriggerService;
}());

var Properties = (function () {
    function Properties(gDriveService) {
        this.gDriveService = gDriveService;
        this.srcFolderID = '';
        this.srcFolderName = '';
        this.srcParentID = '';
        this.destFolderName = '';
        this.copyPermissions = false;
        this.copyTo = '';
        this.destParentID = '';
        this.destId = '';
        this.spreadsheetId = '';
        this.propertiesDocId = '';
        this.leftovers = null;
        this.retryQueue = [];
        this.map = {};
        this.remaining = [];
        this.timeZone = 'GMT-7';
        this.totalRuntime = 0;
        this.completed = {};
        return this;
    }
    Properties.prototype.load = function () {
        var _this = this;
        try {
            var propertiesDocId = PropertiesService.getUserProperties().getProperties()
                .propertiesDocId;
            var propertiesDoc = this.gDriveService.downloadFile(propertiesDocId);
        }
        catch (e) {
            if (e.message.indexOf('Unsupported Output Format') !== -1) {
                throw new Error(ErrorMessages.NoPropertiesDocumentId);
            }
            throw e;
        }
        try {
            var properties = JSON.parse(propertiesDoc);
        }
        catch (e) {
            throw new Error(ErrorMessages.ParseError);
        }
        Object.keys(properties).forEach(function (prop) {
            try {
                _this[prop] = properties[prop];
            }
            catch (e) {
                throw new Error(ErrorMessages.LoadingProp(prop, properties[prop]));
            }
        });
        return this;
    };
    Properties.prototype.incrementTotalRuntime = function (duration) {
        this.totalRuntime += duration;
    };
    Properties.prototype.checkMaxRuntime = function () {
        this.isOverMaxRuntime =
            this.totalRuntime + Timer.MAX_RUNTIME >= Timer.MAX_RUNTIME_PER_DAY;
        return this.isOverMaxRuntime;
    };
    Properties.save = function (properties, gDriveService) {
        try {
            var stringifiedProps = JSON.stringify(properties);
        }
        catch (e) {
            throw new Error(ErrorMessages.SerializeError);
        }
        return gDriveService.updateFile({
            upload: 'multipart',
            alt: 'json'
        }, properties.propertiesDocId, Utilities.newBlob(stringifiedProps));
    };
    Properties.setUserPropertiesStore = function (spreadsheetId, propertiesDocId, destId, resuming) {
        var userProperties = PropertiesService.getUserProperties();
        userProperties.setProperty('destId', destId);
        userProperties.setProperty('spreadsheetId', spreadsheetId);
        userProperties.setProperty('propertiesDocId', propertiesDocId);
        userProperties.setProperty('trials', 0);
        userProperties.setProperty('resuming', resuming);
        userProperties.setProperty('stop', 'false');
    };
    return Properties;
}());

var Constants = (function () {
    function Constants() {
    }
    Constants.BaseCopyLogId = '17xHN9N5KxVie9nuFFzCur7WkcMP7aLG4xsPis8Ctxjg';
    Constants.PropertiesDocTitle = 'DO NOT DELETE OR MODIFY - will be deleted after copying completes';
    Constants.PropertiesDocDescription = 'This document will be deleted after the folder copy is complete. It is only used to store properties necessary to complete the copying procedure';
    Constants.MaxRuntimeExceeded = 'Script has reached daily maximum run time of 90 minutes. Script must pause for 24 hours to reset Google Quotas, and will resume at that time. For more information, please see https://developers.google.com/apps-script/guides/services/quotas';
    Constants.SingleRunExceeded = 'Paused due to Google quota limits - copy will resume in 1-2 minutes';
    Constants.StartCopyingText = 'Started copying';
    Constants.UserStoppedScript = 'Stopped manually by user. Please use "Resume" button to restart copying';
    return Constants;
}());

var Util = (function () {
    function Util() {
    }
    Util.exponentialBackoff = function (func, errorMsg) {
        for (var n = 0; n < 6; n++) {
            try {
                return func();
            }
            catch (e) {
                Logging.log({ status: Util.composeErrorMsg(e) });
                if (n == 5) {
                    Logging.log({
                        status: errorMsg
                    });
                    throw e;
                }
                Utilities.sleep(Math.pow(2, n) * 1000 + Math.round(Math.random() * 1000));
            }
        }
    };
    Util.saveState = function (properties, fileList, logMessage, ss, gDriveService) {
        try {
            properties.leftovers =
                fileList && fileList.items ? fileList : properties.leftovers;
            properties.pageToken = properties.leftovers.nextPageToken;
        }
        catch (e) {
            Logging.log({
                ss: ss,
                status: Util.composeErrorMsg(e, ErrorMessages.FailedSetLeftovers)
            });
        }
        try {
            Properties.save(properties, gDriveService);
        }
        catch (e) {
            if (e.message.indexOf('exceeded their Drive storage quota') !== -1) {
                try {
                    TriggerService.deleteTrigger(PropertiesService.getUserProperties().getProperty('triggerId'));
                }
                catch (e) {
                }
                Logging.log({ ss: ss, status: ErrorMessages.OutOfSpace });
                Logging.log({ ss: ss, status: ErrorMessages.WillDuplicateOnResume });
                return;
            }
            Logging.log({
                ss: ss,
                status: Util.composeErrorMsg(e, ErrorMessages.FailedSaveProperties)
            });
        }
        Logging.log({
            ss: ss,
            status: logMessage
        });
    };
    Util.cleanup = function (properties, fileList, userProperties, timer, quotaManager, ss, gDriveService) {
        properties.incrementTotalRuntime(timer.runtime);
        var stopMsg = Constants.SingleRunExceeded;
        if (quotaManager.stop) {
            stopMsg = Constants.UserStoppedScript;
            TriggerService.deleteTrigger(userProperties.getProperty('triggerId'));
        }
        else if (properties.isOverMaxRuntime) {
            stopMsg = Constants.MaxRuntimeExceeded;
            properties.totalRuntime = 0;
        }
        if (!quotaManager.canContinue() || properties.retryQueue.length > 0) {
            Util.saveState(properties, fileList, stopMsg, ss, gDriveService);
        }
        else {
            TriggerService.deleteTrigger(userProperties.getProperty('triggerId'));
            try {
                gDriveService.updateFile({ labels: { trashed: true } }, properties.propertiesDocId);
            }
            catch (e) {
                Logging.log({
                    ss: ss,
                    status: Util.composeErrorMsg(e)
                });
            }
            ss.getRange(2, 3, 1, 1)
                .setValue('Complete')
                .setBackground('#66b22c');
            ss.getRange(2, 4, 1, 1).setValue(Utilities.formatDate(new Date(), properties.timeZone, 'MM-dd-yy hh:mm:ss a'));
        }
    };
    Util.composeErrorMsg = function (e, customMsg) {
        if (customMsg === void 0) { customMsg = 'Error: '; }
        return customMsg + " " + e.message + ". File: " + e.fileName + ". Line: " + e.lineNumber;
    };
    Util.isNone = function (obj) {
        return obj === null || obj === undefined;
    };
    Util.isSome = function (obj) {
        return !Util.isNone(obj);
    };
    Util.hasSome = function (obj, prop) {
        return obj && obj[prop] && obj[prop].length > 0;
    };
    return Util;
}());

var MimeType = (function () {
    function MimeType() {
    }
    MimeType.PLAINTEXT = 'text/plain';
    MimeType.DOC = 'application/vnd.google-apps.document';
    MimeType.FOLDER = 'application/vnd.google-apps.folder';
    MimeType.SHEET = 'application/vnd.google-apps.spreadsheet';
    MimeType.SLIDES = 'application/vnd.google-apps.presentation';
    MimeType.DRAWING = 'application/vnd.google-apps.drawing';
    MimeType.FORM = 'application/vnd.google-apps.form';
    MimeType.SCRIPT = 'application/vnd.google-apps.script';
    return MimeType;
}());

var API = (function () {
    function API() {
    }
    API.copyFileBody = function (parentId, title, mimeType, description) {
        if (mimeType === void 0) { mimeType = null; }
        if (description === void 0) { description = null; }
        var body = {
            title: title,
            description: description,
            parents: [
                {
                    kind: 'drive#parentReference',
                    id: parentId
                }
            ]
        };
        if (mimeType) {
            body.mimeType = mimeType;
        }
        return body;
    };
    API.permissionBodyValue = function (role, type, value) {
        return {
            role: role,
            type: type,
            value: value
        };
    };
    API.permissionBodyId = function (role, type, id, withLink) {
        return {
            role: role,
            type: type,
            id: id,
            withLink: withLink
        };
    };
    return API;
}());

var GDriveService = (function () {
    function GDriveService() {
        this.lastRequest = Timer.now();
        this.minElapsed = 100;
        this.trottle = this.throttle.bind(this);
        this.maxResults = 200;
        return this;
    }
    GDriveService.prototype.throttle = function (func) {
        var elapsed = Timer.now() - this.lastRequest;
        if (elapsed < this.minElapsed) {
            Utilities.sleep(this.minElapsed - elapsed);
        }
        this.lastRequest = Timer.now();
        return func();
    };
    GDriveService.prototype.getPermissions = function (id) {
        return this.throttle(function () {
            return Drive.Permissions.list(id);
        });
    };
    GDriveService.prototype.getFiles = function (query, pageToken, orderBy) {
        return this.throttle(function () {
            return Drive.Files.list({
                q: query,
                maxResults: this.maxResults,
                pageToken: pageToken,
                orderBy: orderBy
            });
        });
    };
    GDriveService.prototype.downloadFile = function (id) {
        return this.throttle(function () {
            return DriveApp.getFileById(id)
                .getBlob()
                .getDataAsString();
        });
    };
    GDriveService.prototype.updateFile = function (metadata, fileID, mediaData) {
        return this.throttle(function () {
            return Drive.Files.update(metadata, fileID, mediaData);
        });
    };
    GDriveService.prototype.insertFolder = function (body) {
        return this.throttle(function () {
            return Drive.Files.insert(body);
        });
    };
    GDriveService.prototype.insertBlankFile = function (parentID) {
        return this.insertFolder(API.copyFileBody(parentID, Constants.PropertiesDocTitle, MimeType.PLAINTEXT, Constants.PropertiesDocDescription));
    };
    GDriveService.prototype.copyFile = function (body, id) {
        return this.throttle(function () {
            return Drive.Files.copy(body, id);
        });
    };
    GDriveService.prototype.insertPermission = function (body, id, options) {
        return this.throttle(function () {
            return Drive.Permissions.insert(body, id, options);
        });
    };
    GDriveService.prototype.removePermission = function (fileID, permissionID) {
        return this.throttle(function () {
            return Drive.Permissions.remove(fileID, permissionID);
        });
    };
    GDriveService.prototype.getRootID = function () {
        return this.throttle(function () {
            return DriveApp.getRootFolder().getId();
        });
    };
    GDriveService.prototype.openSpreadsheet = function (spreadsheetId) {
        var ss;
        try {
            ss = SpreadsheetApp.openById(spreadsheetId).getSheetByName('Log');
        }
        catch (e) {
            try {
                ss = SpreadsheetApp.openById(PropertiesService.getUserProperties().getProperty('spreadsheetId')).getSheetByName('Log');
            }
            catch (e) {
                throw new Error(ErrorMessages.SpreadsheetNotFound);
            }
        }
        return ss;
    };
    return GDriveService;
}());

var QuotaManager = (function () {
    function QuotaManager(timer, userProperties) {
        this.timer = timer;
        this.userProperties = userProperties;
        this.stop = false;
    }
    QuotaManager.prototype.update = function () {
        this.timer.update();
        this.stop = this.userProperties.getProperty('stop') == 'true';
    };
    QuotaManager.prototype.canContinue = function () {
        return this.timer.canContinue() && !this.stop;
    };
    return QuotaManager;
}());

function doGet(e) {
    var template = HtmlService.createTemplateFromFile('Index');
    return template
        .evaluate()
        .setTitle('Copy a Google Drive folder')
        .setSandboxMode(HtmlService.SandboxMode.IFRAME);
}
function initialize(options) {
    var destFolder, spreadsheet, propertiesDocId, today = Utilities.formatDate(new Date(), 'GMT-5', 'MM-dd-yyyy'), gDriveService = new GDriveService(), timer = new Timer(), properties = new Properties(gDriveService), quotaManager = new QuotaManager(timer, PropertiesService.getUserProperties()), fileService = new FileService(gDriveService, quotaManager, properties);
    destFolder = fileService.initializeDestinationFolder(options, today);
    spreadsheet = fileService.createLoggerSpreadsheet(today, destFolder.id);
    propertiesDocId = fileService.createPropertiesDocument(destFolder.id);
    options.destId = destFolder.id;
    options.spreadsheetId = spreadsheet.id;
    options.propertiesDocId = propertiesDocId;
    options.map = {};
    options.map[options.srcFolderID] = options.destId;
    options.remaining = [options.srcFolderID];
    try {
        SpreadsheetApp.openById(spreadsheet.id)
            .getSheetByName('Log')
            .getRange(2, 5)
            .setValue(FileService.getFileLinkForSheet(destFolder.id, options.destFolderName));
    }
    catch (e) {
        console.error('unable to set folder URL in copy log');
        console.error(e);
    }
    try {
        options.timeZone = SpreadsheetApp.openById(spreadsheet.id).getSpreadsheetTimeZone();
    }
    catch (e) {
        options.timeZone = 'GMT-7';
    }
    try {
        SpreadsheetApp.openById(spreadsheet.id)
            .getSheetByName('Log')
            .getRange(5, 1, 1, 5)
            .setValues([
            [
                Constants.StartCopyingText,
                '',
                '',
                '',
                Utilities.formatDate(new Date(), options.timeZone, 'MM-dd-yy hh:mm:ss aaa')
            ]
        ]);
    }
    catch (e) {
        console.error('unable to write "started copying"');
        console.error(e);
    }
    Properties.setUserPropertiesStore(options.spreadsheetId, options.propertiesDocId, options.destId, 'false');
    Properties.save(options, gDriveService);
    deleteAllTriggers();
    return {
        spreadsheetId: options.spreadsheetId,
        destFolderId: options.destId,
        resuming: false
    };
}
function getMetadata(id, url) {
    try {
        return Drive.Files.get(id);
    }
    catch (e) {
        throw new Error(ErrorMessages.NotFound(url));
    }
}
function getUserEmail() {
    return Session.getActiveUser().getEmail();
}
function resume(options) {
    var gDriveService = new GDriveService(), timer = new Timer(), properties = new Properties(gDriveService), quotaManager = new QuotaManager(timer, PropertiesService.getUserProperties()), fileService = new FileService(gDriveService, quotaManager, properties);
    var priorCopy = fileService.findPriorCopy(options.srcFolderID);
    Properties.setUserPropertiesStore(priorCopy.spreadsheetId, priorCopy.propertiesDocId, options.destFolderId, 'true');
    return {
        spreadsheetId: priorCopy.spreadsheetId,
        destFolderId: options.srcFolderID,
        resuming: true
    };
}
function setStopFlag() {
    return PropertiesService.getUserProperties().setProperty('stop', 'true');
}
function deleteAllTriggers() {
    var allTriggers = ScriptApp.getProjectTriggers();
    for (var i = 0; i < allTriggers.length; i++) {
        ScriptApp.deleteTrigger(allTriggers[i]);
    }
}
function getTriggersQuantity() {
    return ScriptApp.getProjectTriggers().length;
}
function getOAuthToken() {
    return ScriptApp.getOAuthToken();
}

var FileService = (function () {
    function FileService(gDriveService, quotaManager, properties) {
        this.gDriveService = gDriveService;
        this.quotaManager = quotaManager;
        this.properties = properties;
        this.nativeMimeTypes = [
            MimeType.DOC,
            MimeType.DRAWING,
            MimeType.FOLDER,
            MimeType.FORM,
            MimeType.SCRIPT,
            MimeType.SHEET,
            MimeType.SLIDES
        ];
        this.maxNumberOfAttempts = 3;
        return this;
    }
    FileService.prototype.copyFile = function (file) {
        if (file.mimeType == MimeType.FOLDER) {
            var r = this.gDriveService.insertFolder(API.copyFileBody(this.properties.map[file.parents[0].id], file.title, MimeType.FOLDER, file.description));
            this.properties.remaining.push(file.id);
            this.properties.map[file.id] = r.id;
            return r;
        }
        else {
            return this.gDriveService.copyFile(API.copyFileBody(this.properties.map[file.parents[0].id], file.title), file.id);
        }
    };
    FileService.prototype.copyPermissions = function (srcId, owners, destId) {
        var permissions, destPermissions, i, j;
        try {
            permissions = this.gDriveService.getPermissions(srcId).items;
        }
        catch (e) {
            Logging.log({ status: Util.composeErrorMsg(e) });
        }
        if (permissions && permissions.length > 0) {
            for (i = 0; i < permissions.length; i++) {
                try {
                    if (permissions[i].emailAddress) {
                        if (permissions[i].role == 'owner')
                            continue;
                        this.gDriveService.insertPermission(API.permissionBodyValue(permissions[i].role, permissions[i].type, permissions[i].emailAddress), destId, {
                            sendNotificationEmails: 'false'
                        });
                    }
                    else {
                        this.gDriveService.insertPermission(API.permissionBodyId(permissions[i].role, permissions[i].type, permissions[i].id, permissions[i].withLink), destId, {
                            sendNotificationEmails: 'false'
                        });
                    }
                }
                catch (e) { }
            }
        }
        if (owners && owners.length > 0) {
            for (i = 0; i < owners.length; i++) {
                try {
                    this.gDriveService.insertPermission(API.permissionBodyValue('writer', 'user', owners[i].emailAddress), destId, {
                        sendNotificationEmails: 'false'
                    });
                }
                catch (e) { }
            }
        }
        try {
            destPermissions = this.gDriveService.getPermissions(destId).items;
        }
        catch (e) {
            Logging.log({ status: Util.composeErrorMsg(e) });
        }
        if (destPermissions && destPermissions.length > 0) {
            for (i = 0; i < destPermissions.length; i++) {
                for (j = 0; j < permissions.length; j++) {
                    if (destPermissions[i].id == permissions[j].id) {
                        break;
                    }
                    if (j == permissions.length - 1 &&
                        destPermissions[i].role != 'owner') {
                        this.gDriveService.removePermission(destId, destPermissions[i].id);
                    }
                }
            }
        }
    };
    FileService.prototype.handleLeftovers = function (ss) {
        if (Util.hasSome(this.properties.leftovers, 'items')) {
            this.properties.currFolderId = this.properties.leftovers.items[0].parents[0].id;
            this.processFileList(this.properties.leftovers.items, ss);
        }
    };
    FileService.prototype.handleRetries = function (ss) {
        if (Util.hasSome(this.properties, 'retryQueue')) {
            this.properties.currFolderId = this.properties.retryQueue[0].parents[0].id;
            this.processFileList(this.properties.retryQueue, ss);
        }
    };
    FileService.prototype.processFileList = function (items, ss) {
        while (items.length > 0 && this.quotaManager.canContinue()) {
            var item = items.pop();
            if (item.numberOfAttempts &&
                item.numberOfAttempts > this.maxNumberOfAttempts) {
                Logging.logCopyError(ss, item.error, item, this.properties.timeZone);
                continue;
            }
            if (this.properties.completed[item.id]) {
                continue;
            }
            try {
                var newfile = this.copyFile(item);
                this.properties.completed[item.id] = true;
                Logging.logCopySuccess(ss, newfile, this.properties.timeZone);
            }
            catch (e) {
                this.properties.retryQueue.unshift({
                    id: item.id,
                    title: item.title,
                    description: item.description,
                    parents: item.parents,
                    mimeType: item.mimeType,
                    error: e,
                    owners: item.owners,
                    numberOfAttempts: item.numberOfAttempts
                        ? item.numberOfAttempts + 1
                        : 1
                });
            }
            try {
                if (this.properties.copyPermissions &&
                    this.nativeMimeTypes.indexOf(item.mimeType) !== -1) {
                    this.copyPermissions(item.id, item.owners, newfile.id);
                }
            }
            catch (e) {
            }
            this.quotaManager.update;
        }
    };
    FileService.prototype.initializeDestinationFolder = function (options, today) {
        var destFolder;
        var destParentID;
        switch (options.copyTo) {
            case 'same':
                destParentID = options.srcParentID;
                break;
            case 'custom':
                destParentID = options.destParentID;
                break;
            default:
                destParentID = this.gDriveService.getRootID();
        }
        if (options.copyTo === 'custom' &&
            FileService.isDescendant([options.destParentID], options.srcFolderID)) {
            throw new Error(ErrorMessages.Descendant);
        }
        destFolder = this.gDriveService.insertFolder(API.copyFileBody(destParentID, options.destFolderName, 'application/vnd.google-apps.folder', "Copy of " + options.srcFolderName + ", created " + today));
        if (options.copyPermissions) {
            this.copyPermissions(options.srcFolderID, null, destFolder.id);
        }
        return destFolder;
    };
    FileService.prototype.createLoggerSpreadsheet = function (today, destId) {
        return this.gDriveService.copyFile(API.copyFileBody(destId, "Copy Folder Log " + today), Constants.BaseCopyLogId);
    };
    FileService.prototype.createPropertiesDocument = function (destId) {
        var propertiesDoc = this.gDriveService.insertBlankFile(destId);
        return propertiesDoc.id;
    };
    FileService.prototype.findPriorCopy = function (folderId) {
        var query = "'" + folderId + "' in parents and title contains 'DO NOT DELETE OR MODIFY' and mimeType = '" + MimeType.PLAINTEXT + "'";
        var p = this.gDriveService.getFiles(query, null, 'modifiedDate,createdDate');
        query = "'" + folderId + "' in parents and title contains 'Copy Folder Log' and mimeType = '" + MimeType.SHEET + "'";
        var s = this.gDriveService.getFiles(query, null, 'title desc');
        try {
            return {
                spreadsheetId: s.items[0].id,
                propertiesDocId: p.items[0].id
            };
        }
        catch (e) {
            throw new Error(ErrorMessages.DataFilesNotFound);
        }
    };
    FileService.isDescendant = function (maybeChildIDs, maybeParentID) {
        for (var i = 0; i < maybeChildIDs.length; i++) {
            if (maybeChildIDs[i] === maybeParentID) {
                return true;
            }
        }
        var results = [];
        for (i = 0; i < maybeChildIDs.length; i++) {
            var currentParents = getMetadata(maybeChildIDs[i]).parents;
            if (!currentParents || currentParents.length === 0) {
                continue;
            }
            for (i = 0; i < currentParents.length; i++) {
                if (currentParents[i].id === maybeParentID) {
                    return true;
                }
            }
            results.push(FileService.isDescendant(currentParents.map(function (f) {
                return f.id;
            }), maybeParentID));
        }
        for (i = 0; i < results.length; i++) {
            if (results[i]) {
                return true;
            }
        }
        return false;
    };
    FileService.getFileLinkForSheet = function (id, title) {
        if (id) {
            return 'https://drive.google.com/open?id=' + id;
        }
        return '';
    };
    return FileService;
}());

function copy() {
    var gDriveService = new GDriveService(), properties = new Properties(gDriveService), timer = new Timer(), ss, query, fileList, currFolder, userProperties = PropertiesService.getUserProperties(), quotaManager = new QuotaManager(timer, userProperties), triggerId = userProperties.getProperty('triggerId'), fileService = new FileService(gDriveService, quotaManager, properties);
    TriggerService.deleteTrigger(triggerId);
    try {
        Util.exponentialBackoff(properties.load.bind(properties), ErrorMessages.Restarting);
    }
    catch (e) {
        var n = Number(userProperties.getProperties().trials);
        Logger.log(n);
        if (n < 5) {
            Logger.log('setting trials property');
            userProperties.setProperty('trials', (n + 1).toString());
            Util.exponentialBackoff(TriggerService.createTrigger, ErrorMessages.SettingTrigger);
        }
        return;
    }
    ss = gDriveService.openSpreadsheet(properties.spreadsheetId);
    quotaManager.update();
    var duration = timer.calculateTriggerDuration(properties);
    TriggerService.createTrigger(duration);
    fileService.handleLeftovers(ss);
    quotaManager.update();
    while ((properties.remaining.length > 0 || Util.isSome(properties.pageToken)) &&
        quotaManager.canContinue()) {
        if (properties.pageToken && properties.currFolderId) {
            currFolder = properties.currFolderId;
        }
        else {
            try {
                currFolder = properties.remaining.shift();
            }
            catch (e) {
                console.error(ErrorMessages.ParseErrorRemaining);
                console.error(e);
                properties.remaining = JSON.parse(properties.remaining);
                currFolder = properties.remaining.shift();
            }
        }
        query = '"' + currFolder + '" in parents and trashed = false';
        do {
            try {
                fileList = gDriveService.getFiles(query, properties.pageToken);
            }
            catch (e) {
                Logging.log({ ss: ss, status: Util.composeErrorMsg(e) });
            }
            if (!fileList) {
                console.log('fileList is undefined. currFolder:', currFolder);
            }
            if (Util.hasSome(fileList, 'items')) {
                fileService.processFileList(fileList.items, ss);
            }
            else {
                Logger.log('No children found.');
            }
            properties.pageToken = fileList ? fileList.nextPageToken : null;
            quotaManager.update();
        } while (properties.pageToken && quotaManager.canContinue());
    }
    fileService.handleRetries(ss);
    Util.cleanup(properties, fileList, userProperties, timer, quotaManager, ss, gDriveService);
}

exports.doGet = doGet;
exports.initialize = initialize;
exports.getMetadata = getMetadata;
exports.getUserEmail = getUserEmail;
exports.resume = resume;
exports.setStopFlag = setStopFlag;
exports.deleteAllTriggers = deleteAllTriggers;
exports.getTriggersQuantity = getTriggersQuantity;
exports.getOAuthToken = getOAuthToken;
exports.copy = copy;
