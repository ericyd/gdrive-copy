'use strict';

import React from 'react';
import { Picker } from '../util/picker';
import SelectFolder from '../components/SelectFolder';
import Appreciation from '../components/Appreciation';
import PageChanger from '../components/PageChanger';
import Page from '../components/Page';
import Success from '../components/Success';
import Error from '../components/Error';
import Panel from '../components/Panel';
import Overlay from '../components/Overlay';
import FolderLink from '../components/FolderLink';
import RaisedButton from 'material-ui/RaisedButton';
import FlatButton from 'material-ui/FlatButton';
import TextField from 'material-ui/TextField';
import Checkbox from 'material-ui/Checkbox';
import { Stepper, Step, StepLabel } from 'material-ui/Stepper';
import { RadioButton, RadioButtonGroup } from 'material-ui/RadioButton';
import Divider from 'material-ui/Divider';
import { getDriveSpreadsheetURL } from '../util/helpers';

export default class Start extends React.Component {
  constructor() {
    super();

    this.maxSteps = 3; // 4 steps, but 0-indexed

    this.state = {
      stepNum: 0,
      srcFolderID: '',
      srcFolderName: '',
      srcParentID: '',
      destFolderName: '',
      destFolderID: '',
      // must match IDs of copyOptions objects
      copyPermissions: false,
      copyTo: 'same',
      destParentID: '',
      destParentName: '',

      // success/error/processing
      success: false,
      successMsg: '',
      error: false,
      errorMsg: '',
      processing: false,
      processingMsg: ''
    };

    this.handleSubmit = this.handleSubmit.bind(this);
    this.handleFolderSelect = this.handleFolderSelect.bind(this);
    this.handleDestFolderSelect = this.handleDestFolderSelect.bind(this);
    this.handleDestFolderChange = this.handleDestFolderChange.bind(this);
    this.handleCheck = this.handleCheck.bind(this);
    this.handleRadio = this.handleRadio.bind(this);
    this.nextView = this.nextView.bind(this);
    this.prevView = this.prevView.bind(this);
    this.showError = this.showError.bind(this);
    this.showSuccess = this.showSuccess.bind(this);
    this.reset = this.reset.bind(this);
    this.processing = this.processing.bind(this);
    this.pickerCallback = this.pickerCallback.bind(this);
  }

  componentWillReceiveProps(nextProps) {
    // initialize Picker if gapi is loaded
    if (nextProps.isAPILoaded) {
      this.picker = new Picker(this.pickerCallback);
      this.picker.onApiLoad();
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

  clearSelection(id, name) {
    return () => {
      let state = {};
      state[id] = '';
      state[name] = '';
      this.setState(state);
    };
  }

  reset() {
    this.setState({
      stepNum: 0,
      error: false,
      success: false,
      processing: false,
      srcFolderID: '',
      srcFolderName: '',
      copyTo: 'same',
      destParentID: '',
      destParentName: ''
    });
  }

  handleCheck(e) {
    const settings = {};
    settings[e.target.id] = e.target.checked;
    this.setState(settings);
  }

  handleRadio(e, val) {
    this.setState({ copyTo: val });
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
      this.handleFolderSelect(
        doc[google.picker.Document.ID],
        doc[google.picker.Document.NAME],
        doc[google.picker.Document.PARENT_ID]
      );
    } else if (action == google.picker.Action.CANCEL) {
      google.script.host.close();
    }
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
          // after initialized, this begins the copy loop
          google.script.run.copy();
        })
        .withFailureHandler(function(err) {
          _this.showError(err.message);
        })
        .initialize({
          srcFolderID: this.state.srcFolderID,
          srcFolderName: this.state.srcFolderName,
          srcParentID: this.state.srcParentID,
          destFolderName: this.state.destFolderName,
          copyPermissions: this.state.copyPermissions,
          copyTo: this.state.copyTo,
          destParentID: this.state.destParentID
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
   * Sets folder info in state
   * @param {string} id
   * @param {string} name
   * @param {string} parentID
   */
  handleFolderSelect(id, name, parentID) {
    this.setState({
      processing: false,
      error: false,
      srcFolderID: id,
      srcFolderName: name,
      srcParentID: parentID,
      destFolderName: 'Copy of ' + name
    });
  }

  handleDestFolderSelect(id, name) {
    this.setState({
      processing: false,
      error: false,
      destParentID: id,
      destParentName: name
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
    const radioStyle = {
      marginBottom: 16
    };

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
                <FolderLink
                  folderID={this.state.srcFolderID}
                  name={this.state.srcFolderName}
                />
              </li>
              <li>
                Copy:{' '}
                <FolderLink
                  folderID={this.state.destFolderID}
                  name={this.state.destFolderName}
                />
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
              handleFolderSelect={this.handleFolderSelect}
              showError={this.showError}
              processing={this.processing}
              picker={this.picker}
              folderID={this.state.srcFolderID}
              folderName={this.state.srcFolderName}
              reset={this.clearSelection('srcFolderID', 'srcFolderName')}
            />
            {this.state.srcFolderID !== '' && (
              <div className="controls">
                <RaisedButton
                  onClick={this.nextView}
                  primary={true}
                  label="Next"
                />
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
            <div className="controls">
              <FlatButton
                label="Go back"
                onClick={this.reset}
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
            <h3>Permissions</h3>
            <Checkbox
              checked={this.state['copyPermissions']}
              onCheck={this.handleCheck}
              id="copyPermissions"
              label={
                <span>
                  Copy permissions
                  <br />
                  Sharing settings from the original folder and files will be
                  copied
                </span>
              }
            />

            <h3>Copy to</h3>

            <RadioButtonGroup
              name="copyTo"
              defaultSelected="same"
              onChange={this.handleRadio}
            >
              <RadioButton
                value="same"
                label="Same as original"
                style={radioStyle}
              />
              <RadioButton
                value="root"
                label="Root of My Drive"
                style={radioStyle}
              />
              <RadioButton value="custom" label="Custom" style={radioStyle} />
            </RadioButtonGroup>

            {this.state.copyTo === 'custom' && (
              <SelectFolder
                handleFolderSelect={this.handleDestFolderSelect}
                showError={this.showError}
                processing={this.processing}
                folderID={this.state.destParentID}
                folderName={this.state.destParentName}
                reset={this.clearSelection('destParentID', 'destParentName')}
              />
            )}

            <div className="controls">
              <FlatButton
                label="Go back"
                onClick={this.prevView}
                style={{ marginRight: '1em' }}
              />
              <RaisedButton
                onClick={this.nextView}
                primary={true}
                label="Next"
              />
            </div>
          </Page>

          <Page label="Review and start copying" stepNum={3}>
            <Panel>
              <h3>Original Folder</h3>

              <FolderLink
                folderID={this.state.srcFolderID}
                name={this.state.srcFolderName}
              />

              <br />
              <br />
              <h3>Name your copy</h3>
              <span>{this.state.destFolderName}</span>

              <br />
              <br />
              <h3>Options</h3>
              <div>
                Copy permissions to new folder?{' '}
                {this.state.copyPermissions ? 'Yes' : 'No'}
              </div>
              <div>
                Copy to:{' '}
                {this.state.copyTo === 'custom' ? (
                  <FolderLink
                    folderID={this.state.destParentID}
                    name={this.state.destParentName}
                  />
                ) : this.state.copyTo === 'root' ? (
                  'Root of My Drive'
                ) : (
                  'Same as original folder'
                )}
              </div>
            </Panel>

            <div className="controls">
              <FlatButton
                label="Start over"
                onClick={this.reset}
                style={{ marginRight: '1em' }}
              />
              <RaisedButton
                label="Copy Folder"
                primary={true}
                onClick={this.handleSubmit}
              />
            </div>
          </Page>
        </PageChanger>

        {/* show sample folder URL in test mode */}
        {process.env.NODE_ENV !== 'production' && (
          <div>
            https://drive.google.com/drive/folders/19pDrhPLxYRSEgmMDGMdeo1lFW3nT8v9-
          </div>
        )}
      </div>
    );
  }
}
