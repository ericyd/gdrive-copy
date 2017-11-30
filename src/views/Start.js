'use strict';

import React from 'react';
import RaisedButton from 'material-ui/RaisedButton';
import SelectFolder from '../components/SelectFolder';
import TextInput from '../components/TextInput';
import QuestionTooltip from '../components/icons/QuestionTooltip';
import Checkbox from 'material-ui/Checkbox';
import Page from '../components/Page';
import ViewContainer from '../components/ViewContainer';
import Success from '../components/Success';
import Error from '../components/Error';
import Panel from '../components/Panel';
import Overlay from '../components/Overlay';
import { Stepper, Step, StepLabel } from 'material-ui/Stepper';

export default class Start extends React.Component {
  constructor() {
    super();

    this.maxSteps = 3; // 4 steps, but 0-indexed

    this.state = {
      stepNum: 0,
      status: '',
      srcFolderURL: '',
      srcFolderID: '',
      srcFolderName: '',
      srcParentID: '',
      destFolderName: '',
      // must match IDs of copyOptions objects
      copyPermissions: false,
      copyToRoot: false,

      // success/error/processing
      success: false,
      successMsg: '',
      error: false,
      errorMsg: '',
      processing: false,
      processingMsg: ''
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
    this.handleSelectOption = this.handleSelectOption.bind(this);
    this.nextView = this.nextView.bind(this);
    this.showError = this.showError.bind(this);
    this.showSuccess = this.showSuccess.bind(this);
    this.resetForm = this.resetForm.bind(this);
    this.processing = this.processing.bind(this);
  }

  showError(msg) {
    this.setState({
      error: true,
      success: false,
      processing: false,
      errorMsg: msg
    });
  }

  showSuccess(msg) {
    this.setState({
      error: false,
      success: true,
      processing: false,
      successMsg: msg
    });
  }

  processing(msg) {
    this.setState({
      processing: true,
      processingMsg: msg
    });
  }

  resetForm() {
    this.setState({
      stepNum: 0,
      error: false,
      success: false,
      processing: false,
      srcFolderID: '',
      srcFolderName: '',
      srcFolderURL: ''
    });
  }

  handleSelectOption(e) {
    const settings = {};
    settings[e.target.id] = e.target.checked;
    this.setState(settings);
  }

  handleSubmit(e) {
    this.setState({ processing: true });
    const _this = this;
    if (process.env.NODE_ENV === 'production') {
      // count number of triggers
      google.script.run
        .withSuccessHandler(function(number) {
          // prompt user to wait or delete existing triggers
          if (number > 9) {
            _this.showError('Too many triggers');
          } else {
            // if not too many triggers, initialize script
            google.script.run
              .withSuccessHandler(_this.showSuccess)
              .withFailureHandler(_this.showError)
              .initialize({
                srcFolderID: this.state.srcFolderID,
                srcFolderName: this.state.srcFolderName,
                srcFolderURL: this.state.srcFolderURL,
                srcParentID: this.state.srcParentID,
                destFolderName: this.state.destFolderName,
                copyPermissions: this.state.copyPermissions,
                copyToRoot: this.state.copyToRoot
              });
          }
        })
        .withFailureHandler(_this.showError)
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
  handleFolderSelect(url, id, name, parentID) {
    this.setState({
      processing: false,
      srcFolderURL: url,
      srcFolderID: id,
      srcFolderName: name,
      srcParentID: parentID,
      destFolderName: 'Copy of ' + name,
      stepNum: this.state.stepNum + 1
    });
  }

  processing() {
    this.setState({
      processing: true,
      processingMsg: 'Getting folder info'
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
        {this.state.processing && <Overlay label={this.state.processingMsg} />}
        {this.state.success &&
          !this.state.error && (
            <Success>
              <span>testing success</span>
            </Success>
          )}

        {this.state.error &&
          !this.state.success && <Error>{this.state.errorMsg}</Error>}

        {this.state.status}

        <Stepper activeStep={this.state.stepNum}>
          <Step>
            <StepLabel>Select folder</StepLabel>
          </Step>
          <Step>
            <StepLabel>Name the copy</StepLabel>
          </Step>
          <Step>
            <StepLabel>Choose options</StepLabel>
          </Step>
          <Step>
            <StepLabel>Start copying</StepLabel>
          </Step>
        </Stepper>

        <ViewContainer activeStep={this.state.stepNum}>
          <Page stepNum={0} label="Which folder would you like to copy?">
            <SelectFolder
              srcFolderID={this.state.srcFolderID}
              srcFolderURL={this.state.srcFolderURL}
              handleFolderSelect={this.handleFolderSelect}
              showError={this.showError}
              processing={this.processing}
              pickerBuilder={this.props.pickerBuilder}
            />
            {/* show sample folder URL in test mode */}
            {process.env.NODE_ENV !== 'production' && (
              <div>
                https://drive.google.com/drive/folders/19pDrhPLxYRSEgmMDGMdeo1lFW3nT8v9-
              </div>
            )}
          </Page>

          <Page label="Name your copy" stepNum={1}>
            <TextInput
              key="folderCopy"
              id="folderCopy"
              name="folderCopyName"
              label="Copy name"
              handleChange={this.handleDestFolderChange}
              placeholder="Copy name"
              value={this.state.destFolderName}
            />
            <RaisedButton onClick={this.nextView} label="Next" />
          </Page>

          <Page label="Choose copying options" stepNum={2}>
            {this.copyOptions.map(option => {
              return (
                <div className="flex-wrapper">
                  <Checkbox
                    label={option.label}
                    checked={this.state[option.id]}
                    onCheck={this.handleSelectOption}
                    id={option.id}
                    key={option.id}
                    style={{ width: '18em' }}
                  />
                  <QuestionTooltip tooltip={option.tooltip} />
                </div>
              );
            })}
            <RaisedButton onClick={this.nextView} label="Next" />
          </Page>

          <Page label="Review and start copying" stepNum={3}>
            <Panel label="Original folder">
              <a href={this.state.srcFolderURL} target="_blank">
                {this.state.srcFolderName}
              </a>
            </Panel>

            <Panel label="Name of copy">
              <span>{this.state.destFolderName}</span>
            </Panel>

            <Panel label="Options">
              <div>
                Copy permissions to new folder?{' '}
                {this.state.copyPermissions ? 'Yes' : 'No'}
              </div>
              <div>
                Copy to root of My Drive? {this.state.copyToRoot ? 'Yes' : 'No'}
              </div>
            </Panel>

            <RaisedButton label="Go back" onClick={this.resetForm} />
            <RaisedButton
              label="Copy Folder"
              primary={true}
              onClick={this.handleSubmit}
            />
          </Page>
        </ViewContainer>
      </div>
    );
  }
}
