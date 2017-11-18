'use strict';

import React from 'react';
import Button from '../components/Button';
import SelectFolder from '../components/SelectFolder';
import TextInput from '../components/TextInput';
import Step from '../components/Step';
import ViewContainer from '../components/ViewContainer';

export default class Resume extends React.Component {
  constructor() {
    super();

    this.maxSteps = 2;

    this.state = {
      stepNum: 1,
      srcFolderURL: '',
      srcFolderID: '',
      srcFolderName: '',
      status: ''
    };

    this.handleResumeFormSubmit = this.handleResumeFormSubmit.bind(this);
    this.handleFolderSelect = this.handleFolderSelect.bind(this);
    this.nextView = this.nextView.bind(this);
  }

  handleResumeFormSubmit(e) {
    if (process.env.NODE_ENV === 'production') {
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
              .resume(picker.folder);
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
      srcFolderName: name
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
        {this.state.status} {this.props.viewName}
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
            />
          </Step>

          <Step label="Resume the copy" stepNum={2} viewName="Step2">
            <Button
              text="Resume copying"
              handleClick={this.handleResumeFormSubmit}
            />
          </Step>
        </ViewContainer>
        <Button handleClick={this.nextView} text="Next" />
      </div>
    );
  }
}
