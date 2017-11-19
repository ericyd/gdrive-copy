'use strict';

import React from 'react';
import Button from '../components/Button';
import SelectFolder from '../components/SelectFolder';
import TextInput from '../components/TextInput';
import QuestionTooltip from '../components/icons/QuestionTooltip';
import Checkbox from '../components/Checkbox';
import Step from '../components/Step';
import ViewContainer from '../components/ViewContainer';

export default class Start extends React.Component {
  constructor() {
    super();

    this.maxSteps = 4;

    this.state = {
      stepNum: 1,
      srcFolderURL: '',
      srcFolderID: '',
      srcFolderName: '',
      destFolderName: '',
      status: ''
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

    this.handleSubmit = this.handleSubmit.bind(this);
    this.handleFolderSelect = this.handleFolderSelect.bind(this);
    this.handleDestFolderChange = this.handleDestFolderChange.bind(this);
    this.nextView = this.nextView.bind(this);
  }

  handleSubmit(e) {
    if (process.env.NODE_ENV === 'production') {
      // count number of triggers
      google.script.run
        .withSuccessHandler(function(number) {
          // prompt user to wait or delete existing triggers
          if (number > 9) {
            $('#too-many-triggers').show('blind');
            $('#status').hide('blind');
          } else {
            // if not too many triggers, initialize script
            google.script.run
              .withSuccessHandler(success)
              .withFailureHandler(showError)
              .initialize(picker.folder);
          }
        })
        .withFailureHandler(function(err) {
          $('#errors').append(err);
        })
        .getTriggersQuantity();
    } else {
      this.setState({ status: 'done!' });
    }
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

  nextView() {
    if (this.state.stepNum === this.maxSteps) {
      return;
    } else {
      this.setState({ stepNum: this.state.stepNum + 1 });
    }
  }

  render() {
    return (
      <div>
        {this.state.status}
        <ViewContainer view={'Step' + this.state.stepNum}>
          <Step
            viewName="Step1"
            stepNum={1}
            label="Which folder would you like to copy?"
          >
            <SelectFolder
              srcFolderID={this.state.srcFolderID}
              srcFolderURL={this.state.srcFolderURL}
              handleFolderSelect={this.handleFolderSelect}
            />
          </Step>

          <Step label="Name your copy" stepNum={2} viewName="Step2">
            <TextInput
              key="folderCopy"
              id="folderCopy"
              name="folderCopyName"
              label="Copy name"
              handleChange={this.handleDestFolderChange}
              placeholder="Copy name"
              value={this.state.destFolderName}
            />
          </Step>

          <Step label="Choose copying options" stepNum={3} viewName="Step3">
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
          </Step>

          <Step label="Start the copy" stepNum={4} viewName="Step4">
            <Button text="Begin copying" handleClick={this.handleSubmit} />
          </Step>
        </ViewContainer>

        <Button handleClick={this.nextView} text="Next" />

        {/* show sample folder URL in test mode */}
        {process.env.NODE_ENV !== 'production' &&
          'https://drive.google.com/drive/folders/19pDrhPLxYRSEgmMDGMdeo1lFW3nT8v9-'}
      </div>
    );
  }
}
