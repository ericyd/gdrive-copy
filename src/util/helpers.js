/**
 * Parses folder URL string and returns folder ID string
 *
 * @param {string} url the folder URL for the selected folder
 * @return {string} id the folder ID for the selected folder
 */
export function parseURL(input) {
  try {
    const url = new URL(input);
    const idParam = url.searchParams.get('id');
    if (idParam) {
      return idParam;
    }

    const path = url.pathname.split('/');
    if (path.indexOf('folders') !== -1) {
      return path[path.indexOf('folders') + 1];
    }

    return input;
  } catch (e) {
    return input;
  }
}

export function getDriveSpreadsheetURL(id) {
  return `https://docs.google.com/spreadsheets/d/${id}/edit`;
}
