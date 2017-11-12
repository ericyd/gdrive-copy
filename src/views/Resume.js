'use strict';

import React, { Component } from 'react';
import Button from '../components/Button';
import SelectFolder from '../components/SelectFolder';

export default class Resume extends Component {
  constructor() {
    super();

    this.state = {};

    this.handleResumeFormSubmit = this.handleResumeFormSubmit.bind(this);
  }

  handleResumeFormSubmit(e) {
    return;
  }

  render() {
    return (
      <form>
        <SelectFolder />
        <Button
          text="Resume copying"
          handleClick={this.handleResumeFormSubmit}
        />
      </form>
    );
  }
}
