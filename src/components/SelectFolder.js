'use strict';

import React from 'react';
import TextInput from './TextInput';
import Button from './Button';
import Spinner from './icons/Spinner';

export default class SelectFolder extends React.Component {
  constructor() {
    super();
    this.state = {
      folderURL: '',
      folderID: ''
    };
    this.launchPicker = this.launchPicker.bind(this);
    this.getFolderFromURL = this.getFolderFromURL.bind(this);
  }

  launchPicker() {
    return;
  }

  getFolderFromURL(e) {
    this.setState({ folderURL: e.target.value });
    console.log(e.target.value);
    return e.target.value;
  }

  render() {
    return (
      <fieldset>
        <legend>Select folder to copy</legend>
        <TextInput
          key="folderName"
          id="folderName"
          name="folderName"
          label="Folder URL"
          handleChange={this.getFolderFromURL}
          placeholder="Paste Folder URL"
          value=""
        />
        <Button
          text="Picker"
          className="btn--small"
          handleClick={this.launchPicker}
        />
      </fieldset>
    );
  }
}
