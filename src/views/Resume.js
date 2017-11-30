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
      status: '',
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

  handleSubmit(e) {
    const _this = this;
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
      stepNum: this.state.stepNum + 1,
      srcFolderURL: url,
      srcFolderID: id,
      srcFolderName: name,
      srcParentID: parentID
    });
  }

  render() {
    return (
      <div>
        {this.state.processing && <Overlay label={this.state.processingMsg} />}
        {this.state.status}

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
            <FlatButton label="Start over" onClick={this.resetForm} />
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
