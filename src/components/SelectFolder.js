'use strict';

import React from 'react';
// import TextInput from './TextInput';
import TextField from 'material-ui/TextField';
// import Button from './Button';
import RaisedButton from 'material-ui/RaisedButton';
import Step from './Step';
import parseURL from '../util/parseURL';
import { showPicker } from '../util/picker';

export default class SelectFolder extends React.Component {
  constructor() {
    super();
    this.state = {
      value: ''
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
      value: e.target.value
    });
    // handle paste event
    if (e.clipboardData && e.clipboardData.get) {
      this.handlePaste(e);
    }
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
          this.props.handleFolderSelect(
            url,
            id,
            folder.name,
            folder.parents[0].id
          );
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
          srcFolderURL: url
        });
        return _this.props.handleFolderSelect(url, id, name, id);
      }, 1500);
    }
  }

  render() {
    return (
      <div>
        <TextField
          floatingLabelText="Paste Folder URL"
          key="folderName"
          id="folderName"
          name="folderName"
          onChange={this.handleChange}
          value={this.state.value}
        />
        <br />or<br />
        <RaisedButton
          label="Primary"
          primary={true}
          onClick={this.launchPicker}
        />
      </div>
    );
  }
}
