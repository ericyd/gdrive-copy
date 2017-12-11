'use strict';

import React, { Component } from 'react';
import RaisedButton from 'material-ui/RaisedButton';
import Overlay from '../components/Overlay';
import Success from '../components/Success';
import Error from '../components/Error';

export default class Pause extends Component {
  constructor() {
    super();

    this.state = {
      success: false,
      successMsg: '',
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
      successMsg: '',
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
        .withFailureHandler(function(err) {
          _this.showError(err.message);
        })
        .setStopFlag();
    } else {
      if (window.location.search.indexOf('testmode') !== -1) {
        return setTimeout(
          () => _this.showError('This is a testmode error'),
          1000
        );
      }
      return setTimeout(() => _this.showSuccess('Copying has paused'), 1000);
    }
  }

  render() {
    if (this.state.success && !this.state.error) {
      return (
        <Success msg={this.state.successMsg}>
          <p>Your folders should no longer be copying.</p>
          <p>
            Feel free to use the "Resume" feature if you would like to restart
            the copy
          </p>
        </Success>
      );
    }
    return (
      <div>
        {/* Processing */}
        {this.state.processing && <Overlay label={this.state.processingMsg} />}

        {/* Error(s) */}
        {this.state.error &&
          !this.state.success && <Error>{this.state.errorMsg}</Error>}

        {/* Default */}
        <div>
          <h2>Are you sure you want to pause everything?</h2>
          <RaisedButton
            label="Confirm: Pause copying"
            primary={true}
            onClick={this.handlePauseBtn}
          />
        </div>
      </div>
    );
  }
}
