'use strict';

import React, { Component } from 'react';
// import Button from '../components/Button';
import RaisedButton from 'material-ui/RaisedButton';
import Overlay from '../components/Overlay';
import Success from '../components/Success';
import Error from '../components/Error';

export default class Pause extends Component {
  constructor() {
    super();

    this.state = {
      success: false,
      error: false,
      errorMsg: '',
      processing: false,
      processingMsg: 'Pausing all folder copies'
    };

    this.handlePauseBtn = this.handlePauseBtn.bind(this);
    this.showError = this.showError.bind(this);
    this.showSuccess = this.showSuccess.bind(this);
  }

  showError(msg) {
    this.setState({
      error: true,
      success: false,
      processing: false,
      errorMsg: msg
    });
  }

  showSuccess() {
    this.setState({
      error: false,
      success: true,
      processing: false
    });
  }

  handlePauseBtn() {
    this.setState({
      processing: true
    });
    const _this = this;
    if (process.env.NODE_ENV === 'production') {
      google.script.run
        .withSuccessHandler(_this.showSuccess)
        .withErrorHandler(_this.showError)
        .setStopFlag();
    } else {
      setTimeout(_this.showSuccess, 1500);
    }
  }

  render() {
    return (
      <div>
        {/* Processing */}
        {this.state.processing && <Overlay label={this.state.processingMsg} />}

        {/* Success */}
        {this.state.success &&
          !this.state.error && (
            <Success>
              <p>Your folders should no longer be copying.</p>
              <p>
                Feel free to use the "Resume" feature if you would like to
                restart the copy
              </p>
            </Success>
          )}

        {/* Error(s) */}
        {this.state.error &&
          !this.state.success && <Error>{this.state.errorMsg}</Error>}

        {/* Default */}
        {!this.state.error &&
          !this.state.success && (
            <div>
              <h4>Are you sure you want to pause everything?</h4>
              <RaisedButton
                label="Confirm: Pause copying"
                primary={true}
                onClick={this.handlePauseBtn}
              />
            </div>
          )}
      </div>
    );
  }
}
