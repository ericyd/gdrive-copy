'use strict';

import React from 'react';
import SelectFolder from '../components/SelectFolder';
import Appreciation from '../components/Appreciation';
import PageChanger from '../components/PageChanger';
import Page from '../components/Page';
import Success from '../components/Success';
import Error from '../components/Error';
import Panel from '../components/Panel';
import Overlay from '../components/Overlay';
import RaisedButton from 'material-ui/RaisedButton';
import FlatButton from 'material-ui/FlatButton';
import TextField from 'material-ui/TextField';
import Checkbox from 'material-ui/Checkbox';
import { Stepper, Step, StepLabel } from 'material-ui/Stepper';
import { List, ListItem } from 'material-ui/List';
import { getDriveFolderURL, getDriveSpreadsheetURL } from '../util/helpers';

export default class Start extends React.Component {
  constructor() {
    super();

    this.maxSteps = 3; // 4 steps, but 0-indexed

    this.state = {
      stepNum: 0,
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
        label: 'Copy permissions',
        tooltip:
          'Sharing settings from the original folder and files will be copied'
      },
      {
        name: 'copyToRoot',
        value: '1',
        id: 'copyToRoot',
        label: 'Copy to root of My Drive',
        tooltip:
          'By default, it will copy to the same location as the original folder'
      }
    ];

    this.handleSubmit = this.handleSubmit.bind(this);
    this.handleFolderSelect = this.handleFolderSelect.bind(this);
    this.handleDestFolderChange = this.handleDestFolderChange.bind(this);
    this.handleCheck = this.handleCheck.bind(this);
    this.nextView = this.nextView.bind(this);
    this.prevView = this.prevView.bind(this);
    this.showError = this.showError.bind(this);
    this.showSuccess = this.showSuccess.bind(this);
    this.resetForm = this.resetForm.bind(this);
    this.processing = this.processing.bind(this);
    this.pickerCallback = this.pickerCallback.bind(this);
  }

  /**
   * A callback function that extracts the chosen document's metadata from the
   * response object. For details on the response object, see
   * https://developers.google.com/picker/docs/result
   *
   * @param {object} data The response object.
   */
  pickerCallback(data) {
    var action = data[google.picker.Response.ACTION];

    if (action == google.picker.Action.PICKED) {
      var doc = data[google.picker.Response.DOCUMENTS][0];
      this.setState({
        srcFolderID: doc[google.picker.Document.ID],
        srcParentID: doc[google.picker.Document.PARENT_ID],
        srcFolderName: doc[google.picker.Document.NAME]
      });
    } else if (action == google.picker.Action.CANCEL) {
      google.script.host.close();
    }
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
      processingMsg: msg ? msg : ''
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

  handleCheck(e) {
    const settings = {};
    settings[e.target.id] = e.target.checked;
    this.setState(settings);
  }

  handleSubmit(e) {
    this.processing('Initializing the folder copy');
    const _this = this;
    if (process.env.NODE_ENV === 'production') {
      google.script.run
        .withSuccessHandler(function(result) {
          _this.setState({
            destFolderID: result.destFolderId,
            copyLogID: result.spreadsheetId
          });
          _this.showSuccess('Copying has started in background');
        })
        .withFailureHandler(_this.showError)
        .initialize({
          srcFolderID: this.state.srcFolderID,
          srcFolderName: this.state.srcFolderName,
          srcParentID: this.state.srcParentID,
          destFolderName: this.state.destFolderName,
          copyPermissions: this.state.copyPermissions,
          copyToRoot: this.state.copyToRoot
        });
    } else {
      if (window.location.search.indexOf('testmode') !== -1) {
        return setTimeout(
          () => this.showError('This is a testmode error'),
          1000
        );
      }
      return setTimeout(
        () => this.showSuccess('Copying has started in background'),
        1000
      );
    }
  }

  /**
   * Sets this.state.srcFolderID, srcFolderURL, srcFolderName
   * @param {string} id
   * @param {string} name
   * @param {string} parentID
   */
  handleFolderSelect(id, name, parentID) {
    this.setState({
      processing: false,
      srcFolderID: id,
      srcFolderName: name,
      srcParentID: parentID,
      destFolderName: 'Copy of ' + name,
      stepNum: this.state.stepNum + 1
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

  prevView() {
    this.setState({ stepNum: this.state.stepNum - 1 });
  }

  render() {
    if (this.state.success && !this.state.error) {
      return (
        <div>
          <Success msg={this.state.successMsg}>
            Things you should know:
            <ul>
              <li>
                You can close this window, copying will continue in background
              </li>
              <li>
                The{' '}
                <a
                  href={getDriveSpreadsheetURL(this.state.copyLogID)}
                  target="_blank"
                >
                  Copy Log
                </a>{' '}
                will tell you when copying is complete. This page will{' '}
                <b>not</b> update
              </li>
              <li>
                Original folder:{' '}
                <a
                  href={getDriveFolderURL(this.state.srcFolderID)}
                  target="_blank"
                >
                  {this.state.srcFolderName}
                </a>
              </li>
              <li>
                Copy:{' '}
                <a
                  href={getDriveFolderURL(this.state.destFolderID)}
                  target="_blank"
                >
                  {this.state.destFolderName}
                </a>
              </li>
              <li>
                Please do not try to start another copy until this one is
                finished
              </li>
            </ul>
          </Success>
          <Appreciation />
        </div>
      );
    }
    return (
      <div>
        {this.state.processing && <Overlay label={this.state.processingMsg} />}
        {this.state.error &&
          !this.state.success && <Error>{this.state.errorMsg}</Error>}

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
            <StepLabel>Review and confirm</StepLabel>
          </Step>
        </Stepper>

        <PageChanger activeStep={this.state.stepNum}>
          <Page stepNum={0} label="Which folder would you like to copy?">
            <SelectFolder
              srcFolderID={this.state.srcFolderID}
              srcFolderURL={this.state.srcFolderURL}
              handleFolderSelect={this.handleFolderSelect}
              showError={this.showError}
              processing={this.processing}
              picker={this.props.picker}
              pickerCallback={this.pickerCallback}
            />
            {/* show sample folder URL in test mode */}
            {process.env.NODE_ENV !== 'production' && (
              <div>
                https://drive.google.com/drive/folders/19pDrhPLxYRSEgmMDGMdeo1lFW3nT8v9-
              </div>
            )}
          </Page>

          <Page label="Name your copy" stepNum={1}>
            <TextField
              key="folderCopy"
              id="folderCopy"
              name="folderCopyName"
              onChange={this.handleDestFolderChange}
              floatingLabelText="Copy name"
              value={this.state.destFolderName}
            />
            <div>
              <FlatButton
                label="Go back"
                onClick={this.resetForm}
                style={{ marginRight: '1em' }}
              />
              <RaisedButton
                onClick={this.nextView}
                primary={true}
                label="Next"
              />
            </div>
          </Page>

          <Page label="Choose copying options" stepNum={2}>
            <List>
              {this.copyOptions.map(option => {
                return (
                  <ListItem
                    leftCheckbox={
                      <Checkbox
                        checked={this.state[option.id]}
                        onCheck={this.handleCheck}
                        id={option.id}
                        key={option.id}
                      />
                    }
                    primaryText={option.label}
                    secondaryText={option.tooltip}
                  />
                );
              })}
            </List>
            <FlatButton
              label="Go back"
              onClick={this.prevView}
              style={{ marginRight: '1em' }}
            />
            <RaisedButton onClick={this.nextView} primary={true} label="Next" />
          </Page>

          <Page label="Review and start copying" stepNum={3}>
            <Panel label="Original folder">
              <a href={this.state.srcFolderURL} target="_blank">
                {this.state.srcFolderName}
              </a>
            </Panel>

            <Panel label="Name your copy">
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

            <FlatButton
              label="Start over"
              onClick={this.resetForm}
              style={{ marginRight: '1em' }}
            />
            <RaisedButton
              label="Copy Folder"
              primary={true}
              onClick={this.handleSubmit}
            />
          </Page>
        </PageChanger>
      </div>
    );
  }
}
