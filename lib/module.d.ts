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
  leftovers?: gapi.client.drive.FileList;
  map?: object;
  remaining?: string[];
  timeZone?: string;
};
