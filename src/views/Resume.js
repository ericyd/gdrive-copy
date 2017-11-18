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
      srcFolderName: ''
    };

    this.handleStartFormSubmit = this.handleStartFormSubmit.bind(this);
    this.handleFolderSelect = this.handleFolderSelect.bind(this);
    this.handleDestFolderChange = this.handleDestFolderChange.bind(this);
    this.nextView = this.nextView.bind(this);
  }

  handleStartFormSubmit(e) {
    return;
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

          <Step label="Start the copy" stepNum={2} viewName="Step2">
            <Button
              text="Begin copying"
              handleClick={this.handleStartFormSubmit}
            />
          </Step>
        </ViewContainer>

        <button onClick={this.nextView}>Next</button>
      </div>
    );
  }
}
