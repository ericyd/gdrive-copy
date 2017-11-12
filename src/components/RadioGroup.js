'use strict';

import React from 'react';

export default function RadioGroup(props) {
  return (
    <fieldset>
      <label htmlFor={props.name + '-yes'}>Yes</label>
      <input
        type="radio"
        name={props.name}
        value="1"
        id={props.name + '-yes'}
      />

      <label htmlFor={props.name + '-no'}>No</label>
      <input type="radio" name={props.name} value="0" id={props.name + '-no'} />
    </fieldset>
  );
}
