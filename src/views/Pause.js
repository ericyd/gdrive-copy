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

    this.state = {
      success: false
    };

    this.handlePauseBtn = this.handlePauseBtn.bind(this);
  }

  handlePauseBtn() {
    if (process.env.NODE_ENV === 'production') {
      google.script.run
        .withSuccessHandler(status => {
          return;
        })
        .withErrorHandler(err => {
          // display error message
          return err;
        })
        .setStopFlag();
    } else {
      this.setState({ success: true });
    }
  }

  render() {
    let show;
    if (this.state.success) {
      show = <h4>Success!</h4>;
    } else {
      show = (
        <div>
          <h4>Are you sure you want to pause everything?</h4>
          <Button
            text="Confirm: Pause copying"
            handleClick={this.handlePauseBtn}
          />
        </div>
      );
    }
    return <div>{show}</div>;
  }
}
