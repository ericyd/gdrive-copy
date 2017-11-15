'use strict';

import React from 'react';
import TextInput from './TextInput';
import Button from './Button';
import Spinner from './icons/Spinner';

export default class SelectFolder extends React.Component {
  constructor() {
    super();
    this.launchPicker = this.launchPicker.bind(this);
    this.getFolderFromURL = this.getFolderFromURL.bind(this);
  }

  launchPicker() {
    return;
  }

  getFolderFromURL(e) {
    return e.target.value;
  }

  render() {
    return (
      <div>
        <TextInput
          name="folderName"
          tempName=""
          placeholder="Paste Folder URL"
          handlePaste={this.getFolderFromURL}
        />
        <Button
          text="Picker"
          className="btn--small"
          handleClick={this.launchPicker}
        />
      </div>
    );
  }
}
