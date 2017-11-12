// from svelte version
// <p>{{message}}</p>
// <p>
// {{#if showButton}}
//     <button
//         type="button"
//         class="btn btn--small"
//         on:click='handleClick(event)'>
//         Yes, I want to stop all my current instances of Copy Folder</button>
// {{/if}}
// </p>

'use strict';

import React from 'react';
import SubmitBtn from '../components/SubmitBtn';

export default class Pause extends Component {
  constructor() {
    super();

    this.state = {
    };

    this.handlePauseBtn = this.handlePauseBtn.bind(this);
  }

  handlePauseBtn() {
    return;
  }

  render() {
    return (
      <h2>Are you sure you want to pause everything?</h2>
      <SubmitBtn text='Confirm: Pause copying' handleClick={this.handlePauseBtn} />
    )
  }
}
