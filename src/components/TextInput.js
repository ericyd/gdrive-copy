'use strict';

import React from 'react';

export default function TextInput(props) {
  return (
    <fieldset>
      <label htmlFor={props.name}>
        {props.name}

        <input
          type="text"
          name={props.name}
          value={props.tempName}
          placeholder={props.placeholder}
          id={props.name}
          onPaste={props.handlePaste}
        />
      </label>
    </fieldset>
  );
}
