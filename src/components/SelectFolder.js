'use strict';

import React from 'react';
import TextInput from './TextInput';
import Button from './Button';
import Spinner from './icons/Spinner';
import Fieldset from './Fieldset';
import parseURL from '../util/parseURL';

export default class SelectFolder extends React.Component {
  constructor() {
    super();
    this.state = {
      srcFolderURL: '',
      srcFolderID: '',
      srcFolderName: ''
    };
    this.launchPicker = this.launchPicker.bind(this);
    this.getFolderFromURL = this.getFolderFromURL.bind(this);
    this.handleChange = this.handleChange.bind(this);
  }

  launchPicker() {
    return;
  }

  handleChange(e) {
    this.setState({
      srcFolderURL: e.target.value
    });
  }

  getFolderFromURL(e) {
    const url = e.target.value;
    const id = parseURL(url);
    if ('undefined' != typeof google) {
      const name = google.script.run
        .withSuccessHandler(folder => {
          this.setState({
            srcFolderURL: url,
            srcFolderID: id,
            srcFolderName: folder.name
          });
          return this.props.handleFolderSelect(url, id, folder.name);
        })
        .withErrorHandler(err => {
          // display error message
          return err;
        })
        .getFolder(id);
    } else {
      name = 'testing name';
      this.setState({
        srcFolderURL: url,
        srcFolderID: id,
        srcFolderName: name
      });
      return this.props.handleFolderSelect(url, id, name);
    }
  }

  render() {
    return (
      <Fieldset legend="Select folder to copy">
        <TextInput
          key="folderName"
          id="folderName"
          name="folderName"
          label="Folder URL"
          handlePaste={this.getFolderFromURL}
          handleChange={this.handleChange}
          placeholder="Paste Folder URL"
          value={this.state.srcFolderURL}
        />
        <Button
          text="Picker"
          className="btn--small"
          handleClick={this.launchPicker}
        />
      </Fieldset>
    );
  }
}
