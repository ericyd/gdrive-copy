'use strict';

import React, { Component } from 'react';
import TextInput from './TextInput';
import Button from './Button';

export default class SelectFolder extends Component {
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
