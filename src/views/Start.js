'use strict';

import React from 'react';
import Button from '../components/Button';
import SelectFolder from '../components/SelectFolder';
import TextInput from '../components/TextInput';
import QuestionTooltip from '../components/icons/QuestionTooltip';
import Checkbox from '../components/Checkbox';
import Fieldset from '../components/Fieldset';
import ViewContainer from '../components/ViewContainer';

export default class Start extends React.Component {
  constructor() {
    super();

    this.state = {
      view: 'Step1',
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
    this.rotateViews = this.rotateViews.bind(this);
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

  rotateViews() {
    switch (this.state.view) {
      case 'Step1':
        this.setState({ view: 'Step2' });
        break;
      case 'Step2':
        this.setState({ view: 'Step3' });
        break;
      case 'Step3':
        this.setState({ view: 'Step4' });
        break;
      default:
        this.setState({ view: 'Step1' });
    }
  }

  render() {
    return (
      <div>
        <button onClick={this.rotateViews}>rotate</button>
        <ViewContainer view={this.state.view}>
          <SelectFolder
            srcFolderID={this.state.srcFolderID}
            srcFolderURL={this.state.srcFolderURL}
            handleFolderSelect={this.handleFolderSelect}
            viewName="Step1"
          />

          <Fieldset legend="Name your copy" viewName="Step2">
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

          <Fieldset legend="Choose copying options" viewName="Step3">
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

          <Button
            viewName="Step 4"
            text="Begin copying"
            handleClick={this.handleStartFormSubmit}
          />
        </ViewContainer>
      </div>
    );
  }
}
