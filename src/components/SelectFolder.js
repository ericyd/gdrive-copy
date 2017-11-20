'use strict';

import React from 'react';
import TextInput from './TextInput';
import Button from './Button';
import Step from './Step';
import parseURL from '../util/parseURL';
import { showPicker } from '../util/picker';

export default class SelectFolder extends React.Component {
  constructor() {
    super();
    this.state = {
      srcFolderURL: '',
      srcFolderID: '',
      srcFolderName: ''
    };
    this.launchPicker = this.launchPicker.bind(this);
    this.handlePaste = this.handlePaste.bind(this);
    this.handleChange = this.handleChange.bind(this);
  }

  launchPicker() {
    showPicker();
  }

  // allow TextInput to update if typing in
  // todo: should this be removed to only support pasting?
  handleChange(e) {
    this.setState({
      srcFolderURL: e.target.value
    });
  }

  /**
   * Parse the text pasted into the input
   * and extract an ID. Then call google script
   * to get metadata for that folder ID.
   * @param {pasteEvent} e
   */
  handlePaste(e) {
    const url = e.clipboardData.getData('Text');
    const id = parseURL(url);
    if (process.env.NODE_ENV === 'production') {
      this.props.processing();
      const name = google.script.run
        .withSuccessHandler(folder => {
          this.setState({
            srcFolderURL: url
          });
          this.props.handleFolderSelect(url, id, folder.name);
        })
        .withErrorHandler(err => {
          this.props.showError(err);
        })
        .getFolder(id);
    } else {
      // TEST MODE
      // ======================
      const _this = this;
      _this.props.processing();
      return setTimeout(function() {
        _this.setState({
          srcFolderURL: url,
          srcFolderID: id,
          srcFolderName: 'testing name'
        });
        return _this.props.handleFolderSelect(url, id, name);
      }, 1500);
    }
  }

  render() {
    return (
      <div>
        <TextInput
          key="folderName"
          id="folderName"
          name="folderName"
          label="Folder URL"
          handlePaste={this.handlePaste}
          handleChange={this.handleChange}
          placeholder="Paste Folder URL"
          value={this.state.srcFolderURL}
        />
        <br />or<br />
        <Button
          text="Select folder"
          className="btn--small"
          handleClick={this.launchPicker}
        />
      </div>
    );
  }
}
