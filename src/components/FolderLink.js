'use strict';

import React from 'react';
import PropTypes from 'prop-types';

const getDriveFolderURL = id => `https://drive.google.com/drive/folders/${id}`;

export default function FolderLink(props) {
  return (
    <a href={getDriveFolderURL(props.folderID)} target="_blank">
      {props.name}
    </a>
  );
}

FolderLink.propTypes = {
  name: PropTypes.string.isRequired,
  folderID: PropTypes.string.isRequired
};
