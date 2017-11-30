'use strict';

import React from 'react';
// import Button from '../components/Button';
import RaisedButton from 'material-ui/RaisedButton';
import SelectFolder from '../components/SelectFolder';
import Step from '../components/Step';
import ViewContainer from '../components/ViewContainer';
import Success from '../components/Success';
import Error from '../components/Error';
import Overlay from '../components/Overlay';

export default class Resume extends React.Component {
  constructor() {
    super();

    this.maxSteps = 2;

    this.state = {
      stepNum: 1,
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
    this.nextView = this.nextView.bind(this);
    this.showError = this.showError.bind(this);
    this.processing = this.processing.bind(this);
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
      stepNum: 2,
      srcFolderURL: url,
      srcFolderID: id,
      srcFolderName: name,
      srcParentID: parentID
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
        {this.state.status}
        <ViewContainer view={'Step' + this.state.stepNum}>
          <Step
            viewName="Step1"
            stepNum={1}
            label="Which folder are you resuming?"
          >
            <SelectFolder
              srcFolderID={this.state.srcFolderID}
              srcFolderURL={this.state.srcFolderURL}
              handleFolderSelect={this.handleFolderSelect}
              showError={this.showError}
              processing={this.processing}
              pickerBuilder={this.props.pickerBuilder}
            />
          </Step>

          <Step label="Resume the copy" stepNum={2} viewName="Step2">
            <RaisedButton
              label="Resume copying"
              primary={true}
              onClick={this.handleSubmit}
            />
          </Step>
        </ViewContainer>

        <RaisedButton onClick={this.nextView} label="Next" />

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
