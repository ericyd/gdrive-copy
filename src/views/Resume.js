'use strict';

import React from 'react';
import RaisedButton from 'material-ui/RaisedButton';
import FlatButton from 'material-ui/FlatButton';
import SelectFolder from '../components/SelectFolder';
import Page from '../components/Page';
import ViewContainer from '../components/ViewContainer';
import Panel from '../components/Panel';
import Success from '../components/Success';
import Error from '../components/Error';
import Overlay from '../components/Overlay';
import { Stepper, Step, StepLabel } from 'material-ui/Stepper';

export default class Resume extends React.Component {
  constructor() {
    super();

    this.maxSteps = 1; // 2 steps, but 0-indexed

    this.state = {
      stepNum: 0,
      srcFolderURL: '',
      srcFolderID: '',
      srcFolderName: '',
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
    this.resetForm = this.resetForm.bind(this);
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

  handleSubmit(e) {
    const _this = this;
    this.processing('Resuming the folder copy');
    if (process.env.NODE_ENV === 'production') {
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
              .resume(_this.state);
          }
        })
        .withFailureHandler(_this.showError)
        .getTriggersQuantity();
    } else {
      if (window.location.search.indexOf('testmode') !== 0) {
        return setTimeout(
          () => this.showError('This is a testmode error'),
          1000
        );
      }
      return setTimeout(() => this.showSuccess('Copying has resumed'), 1000);
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
      stepNum: this.state.stepNum + 1,
      srcFolderURL: url,
      srcFolderID: id,
      srcFolderName: name,
      srcParentID: parentID
    });
  }

  render() {
    if (this.state.success && !this.state.error) {
      return (
        <Success msg={this.state.successMsg}>
          <ul>
            <li>
              Copying folder "{this.state.srcFolderName}". You may close this
              window and the copying will continue in the background.
            </li>
            <li>
              Please check the {this.state.srcFolderURL} for progress updates.
              This log is located inside the newly created folder.
            </li>
            <li>
              The new folder copy can be found {this.state.destFolderName}.
            </li>
            <li>
              At this time, you can only copy one folder at a time. Please wait
              until this copy completes before starting another.
            </li>
          </ul>
        </Success>
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

        <ViewContainer activeStep={this.state.stepNum}>
          <Page stepNum={0} label="Which folder are you resuming?">
            Please select the folder copy, not the original folder.
            <SelectFolder
              srcFolderID={this.state.srcFolderID}
              srcFolderURL={this.state.srcFolderURL}
              handleFolderSelect={this.handleFolderSelect}
              showError={this.showError}
              processing={this.processing}
              pickerBuilder={this.props.pickerBuilder}
            />
          </Page>

          <Page stepNum={1} label="Resume the copy">
            <Panel label="Selected folder">
              <a href={this.state.srcFolderURL} target="_blank">
                {this.state.srcFolderName}
              </a>
            </Panel>
            <FlatButton
              label="Start over"
              onClick={this.resetForm}
              style={{ marginRight: '1em' }}
            />
            <RaisedButton
              label="Resume copying"
              primary={true}
              onClick={this.handleSubmit}
            />
          </Page>
        </ViewContainer>

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
