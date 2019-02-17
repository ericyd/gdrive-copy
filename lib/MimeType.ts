// An enum makes more sense here but the compiled enums don't play nicely with Google Apps Script
export default class MimeType {
  static PLAINTEXT = 'text/plain';
  static DOC = 'application/vnd.google-apps.document';
  static FOLDER = 'application/vnd.google-apps.folder';
  static SHEET = 'application/vnd.google-apps.spreadsheet';
  static SLIDES = 'application/vnd.google-apps.presentation';
  static DRAWING = 'application/vnd.google-apps.drawing';
  static FORM = 'application/vnd.google-apps.form';
  static SCRIPT = 'application/vnd.google-apps.script';
}
