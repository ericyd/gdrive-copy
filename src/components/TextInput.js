'use strict';

import React from 'react';

export default class TextInput extends React.Component {
  constructor() {
    super();
    this.state = {};
    this.handleChange = this.handleChange.bind(this);
  }

  componentWillMount() {
    // the state will be determined by the type of Input passed to this component.
    this.setState({ value: this.props.value });
  }

  // update internal state to allow user interaction
  handleChange(e) {
    this.setState({ value: e.target.value });
    this.props.handleChange(e);
  }

  render() {
    return (
      <label className="textfield" htmlFor={this.props.id}>
        <span className="textfield__label">{this.props.label}</span>

        <input
          type="text"
          name={this.props.name}
          value={this.state.value}
          placeholder={this.props.placeholder}
          id={this.props.id}
          onChange={this.handleChange}
          onPaste={this.props.handlePaste}
        />
      </label>
    );
  }
}
