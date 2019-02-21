/**
 * Represents the options sent from the front end client when initiating a copy
 */
type FrontEndOptions = {
  srcFolderID: string;
  srcParentId: string;
  srcFolderName: string;
  srcFolderURL: string;
  srcParentID: string;
  destFolderName: string;
  copyPermissions: boolean;
  copyTo: string;
  destParentID: string;
  destId?: string;
  spreadsheetId?: string;
  propertiesDocId?: string;
  leftovers?: gapi.client.drive.FileListResource;
  map?: object;
  remaining?: string[];
  timeZone?: string;
  destFolderId?: string;
};

/**
 * Drive must be declared since we aren't using the gapi library but using it for typings
 */
declare namespace Drive {
  const Files: gapi.client.drive.files;
  const Permissions: gapi.client.drive.PermissionsResource;
}
