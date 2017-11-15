'use strict';

import React from 'react';
import Button from '../components/Button';
import SelectFolder from '../components/SelectFolder';
import TextInput from '../components/TextInput';
import RadioGroup from '../components/RadioGroup';

export default class Start extends React.Component {
  constructor() {
    super();

    this.state = {};

    this.handleStartFormSubmit = this.handleStartFormSubmit.bind(this);
  }

  handleStartFormSubmit(e) {
    return;
  }

  render() {
    return (
      <form>
        <SelectFolder />
        <TextInput name="folderName" tempName="" placeholder="Copy of Folder" />
        <RadioGroup name="copyPermissions" />
        <Button text="Begin copying" handleClick={this.handleStartFormSubmit} />
      </form>
    );
  }
}
