'use strict';

import React from 'react';

export default function TextInput(props) {
  return (
    <label className="textfield" htmlFor={props.id}>
      <span className="textfield__label">{props.label}</span>

      <input
        type="text"
        name={props.name}
        value={props.value}
        placeholder={props.placeholder}
        id={props.id}
        onChange={props.handleChange}
        onPaste={props.handlePaste}
      />
    </label>
  );
}
