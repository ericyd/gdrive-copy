'use strict';

import React, { Component } from 'react';

export default class Button extends Component {
  constructor() {
    super();
  }

  handleClick() {
    return this.props.handleClick();
  }

  render() {
    return (
      <button
        type="button"
        key={this.props.text}
        name={this.props.text}
        className={['btn', this.props.className].join(' ')}
        onClick={this.handleClick}
      >
        {this.props.text}
      </button>
    );
  }
}
