'use strict';

import React from 'react';
import { Picker } from '../util/picker';
import RaisedButton from 'material-ui/RaisedButton';
import FlatButton from 'material-ui/FlatButton';
import SelectFolder from '../components/SelectFolder';
import Page from '../components/Page';
import PageChanger from '../components/PageChanger';
import Panel from '../components/Panel';
import Success from '../components/Success';
import Error from '../components/Error';
import Appreciation from '../components/Appreciation';
import Overlay from '../components/Overlay';
import FolderLink from '../components/FolderLink';
import { Stepper, Step, StepLabel } from 'material-ui/Stepper';
import { getDriveSpreadsheetURL } from '../util/helpers';

export default class Resume extends React.Component {
  constructor() {
    super();

    this.maxSteps = 1; // 2 steps, but 0-indexed

    this.state = {
      stepNum: 0,
      srcFolderID: '',
      srcFolderName: '',
      destFolderID: '',
      success: false,
      successMsg: '',
      error: false,
      errorMsg: '',
      processing: false,
      processingMsg: ''
    };

    this.handleSubmit = this.handleSubmit.bind(this);
    this.handleFolderSelect = this.handleFolderSelect.bind(this);
    this.showError = this.showError.bind(this);
    this.showSuccess = this.showSuccess.bind(this);
    this.processing = this.processing.bind(this);
    this.reset = this.reset.bind(this);
    this.pickerCallback = this.pickerCallback.bind(this);
    this.nextView = this.nextView.bind(this);
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
      success: false,
      error: true,
      processing: false,
      errorMsg: msg
    });
  }

  showSuccess(msg) {
    this.setState({
      success: true,
      error: false,
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

  reset() {
    this.setState({
      stepNum: 0,
      error: false,
      success: false,
      processing: false,
      srcFolderID: '',
      srcFolderName: ''
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

  nextView() {
    if (this.state.stepNum === this.maxSteps) {
      return;
    } else {
      this.setState({ stepNum: this.state.stepNum + 1 });
    }
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
    const _this = this;
    this.processing('Resuming the folder copy');
    if (process.env.NODE_ENV === 'production') {
      // if not too many triggers, initialize script
      google.script.run
        .withSuccessHandler(function(results) {
          _this.setState({
            copyLogID: results.spreadsheetId,
            destFolderID: results.destFolderId
          });
          _this.showSuccess('Copying has resumed');
          // after initialized, this begins the copy loop
          google.script.run.copy();
        })
        .withFailureHandler(function(err) {
          _this.showError(err.message);
        })
        .resume(_this.state);
    } else {
      if (window.location.search.indexOf('testmode') !== -1) {
        return setTimeout(
          () => this.showError('This is a testmode error'),
          1000
        );
      }
      return setTimeout(() => this.showSuccess('Copying has resumed'), 1000);
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
      srcParentID: parentID
    });
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
                Copy:{' '}
                <FolderLink
                  folderID={this.state.srcFolderID}
                  name={this.state.srcFolderName}
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
            <StepLabel>Review and confirm</StepLabel>
          </Step>
        </Stepper>

        <PageChanger activeStep={this.state.stepNum}>
          <Page stepNum={0} label="Which folder are you resuming?">
            Please select the folder copy, not the original folder.
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

          <Page stepNum={1} label="Resume the copy">
            <Panel label="Selected folder">
              <FolderLink
                folderID={this.state.srcFolderID}
                name={this.state.srcFolderName}
              />
            </Panel>
            <div className="controls">
              <FlatButton
                label="Start over"
                onClick={this.reset}
                style={{ marginRight: '1em' }}
              />
              <RaisedButton
                label="Resume copying"
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
