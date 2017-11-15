// from svelte version
// <p>{{message}}</p>
// <p>
// {{#if showButton}}
//     <button
//         type="button"
//         className="btn btn--small"
//         on:click='handleClick(event)'>
//         Yes, I want to stop all my current instances of Copy Folder</button>
// {{/if}}
// </p>

'use strict';

import React, { Component } from 'react';
import Button from '../components/Button';

export default class Pause extends Component {
  constructor() {
    super();

    this.state = {};

    this.handlePauseBtn = this.handlePauseBtn.bind(this);
  }

  handlePauseBtn() {
    return;
  }

  render() {
    return (
      <div>
        <h4>Are you sure you want to pause everything?</h4>
        <Button
          text="Confirm: Pause copying"
          handleClick={this.handlePauseBtn}
        />
      </div>
    );
  }
}
