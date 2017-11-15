'use strict';

import React from 'react';

export default class TextInput extends React.Component {
  constructor() {
    super();
  }

  render() {
    return (
      <label className="textfield" htmlFor={this.props.id}>
        <span className="textfield__label">{this.props.label}</span>

        <input
          type="text"
          name={this.props.name}
          value={this.props.value}
          placeholder={this.props.placeholder}
          id={this.props.id}
          onChange={this.props.handleChange}
          onPaste={this.props.handlePaste}
        />
      </label>
    );
  }
}
