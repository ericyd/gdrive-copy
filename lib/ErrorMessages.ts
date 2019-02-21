// An enum makes more sense here but the compiled enums don't play nicely with Google Apps Script
export default class ErrorMessages {
  static DataFilesNotFound =
    'Could not find the necessary data files in the selected folder. Please ensure that you selected the in-progress copy and not the original folder.';

  static Descendant =
    'Cannot select destination folder that exists within the source folder';

  static FailedSaveProperties =
    'Failed to save properties. This could affect script performance and may require restarting the copy. Error Message: ';

  static FailedSetLeftovers =
    'Failed to set leftover file list. Error Message: ';

  static LoadingProp = (key: string, value: string) =>
    `Error loading property ${key} to properties object. Attempted to save: ${value}`;

  static NoPropertiesDocumentId =
    'Could not determine properties document ID. Please try running the script again';

  static NotFound = (url: string) =>
    `Unable to find a folder with the supplied URL. You submitted ${url}. Please verify that you are using a valid folder URL and try again.`;

  static OutOfSpace =
    'You have run out of space in your Drive! You should delete some files and then come back and use the "Resume" feature to restart your copy.';

  static ParseError =
    "Unable to parse the properties document. This is likely a bug, but it is worth trying one more time to make sure it wasn't a fluke.";

  static ParseErrorRemaining = 'properties.remaining is not parsed correctly';

  static Restarting = 'Error restarting script, trying again...';

  static SerializeError =
    'Failed to serialize script properties. This is a critical failure. Please start your copy again.';

  static SettingTrigger =
    'Error setting trigger.  There has been a server error with Google Apps Script. To successfully finish copying, please refresh the app and click "Resume Copying" and follow the instructions on the page.';

  static SpreadsheetTooLarge =
    'The spreadsheet is too large to continue logging, but the service will continue to run in the background';

  static SpreadsheetNotFound = 'Cannot locate spreadsheet. Please try again.';

  static WillDuplicateOnResume =
    'HEADS UP! Your most recently copied files WILL BE DUPLICATED if you resume. To avoid duplicating, you will need to restart your copy from the beginning';
}
