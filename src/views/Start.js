'use strict';

import React from 'react';
import Button from '../components/Button';
import SelectFolder from '../components/SelectFolder';
import TextInput from '../components/TextInput';
import QuestionTooltip from '../components/icons/QuestionTooltip';
import Checkbox from '../components/Checkbox';
import Fieldset from '../components/Fieldset';

export default class Start extends React.Component {
  constructor() {
    super();

    this.state = {
      srcFolderURL: '',
      srcFolderID: '',
      srcFolderName: '',
      destFolderName: ''
    };

    this.copyOptions = [
      {
        name: 'copyPermissions',
        value: '1',
        id: 'copyPermissions',
        label: 'Copy permissions to new folder',
        tooltip:
          "Check this box if you want the documents in the folder copy to be editable/viewable by the same people as the originals. Owners of originals will become editors of the copies. Copying takes much longer if 'Yes' is selected."
      },
      {
        name: 'copyToRoot',
        value: '1',
        id: 'copyToRoot',
        label: 'Copy to root of My Drive',
        tooltip:
          'Check this box if you would like the copy in the top of your Google Drive. By default, it will copy to the same location as the original folder.'
      }
    ];

    this.handleStartFormSubmit = this.handleStartFormSubmit.bind(this);
    this.handleFolderSelect = this.handleFolderSelect.bind(this);
    this.handleDestFolderChange = this.handleDestFolderChange.bind(this);
  }

  handleStartFormSubmit(e) {
    return;
  }

  /**
   * Sets this.state.srcFolderID, srcFolderURL, srcFolderName
   * @param {string} url
   * @param {string} id
   * @param {string} name
   */
  handleFolderSelect(url, id, name) {
    this.setState({
      srcFolderURL: url,
      srcFolderID: id,
      srcFolderName: name,
      destFolderName: 'Copy of ' + name
    });
  }

  handleDestFolderChange(e) {
    this.setState({
      destFolderName: e.target.value
    });
  }

  render() {
    return (
      <form>
        <SelectFolder
          srcFolderID={this.state.srcFolderID}
          srcFolderURL={this.state.srcFolderURL}
          handleFolderSelect={this.handleFolderSelect}
        />

        <Fieldset legend="Name your copy">
          <TextInput
            key="folderCopy"
            id="folderCopy"
            name="folderCopyName"
            label="Copy name"
            handleChange={this.handleDestFolderChange}
            placeholder="Copy name"
            value={this.state.destFolderName}
          />
        </Fieldset>

        <Fieldset legend="Choose copying options">
          {this.copyOptions.map(option => {
            return (
              <Checkbox
                name={option.name}
                value={option.value}
                id={option.id}
                key={option.id}
                label={option.label}
              >
                <QuestionTooltip tooltip={option.tooltip} />
              </Checkbox>
            );
          })}
        </Fieldset>

        <Button text="Begin copying" handleClick={this.handleStartFormSubmit} />
      </form>
    );
  }
}
