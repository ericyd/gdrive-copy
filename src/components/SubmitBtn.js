'use strict';

import React from 'react';

export default class SubmitBtn extends Component {
  constructor() {
    super();
  }

  handleClick() {
    return;
  }

  render() {
    return (
      <button
        type="button"
        key={this.props.text}
        name={this.props.text}
        className={'btn'}
        onClick={this.handleClick}
      >
        {this.props.text}
      </button>
    );
  }
}
