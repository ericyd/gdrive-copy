'use strict';

import React from 'react';

export default function Checkbox(props) {
  return (
    <div>
      <label htmlFor={props.id} className="checkbox">
        <input
          type="checkbox"
          name={props.name}
          value={props.value}
          checked={props.isChecked}
          id={props.id}
          onChange={props.handleChange}
        />
        <span className="checkbox__label">
          {props.label} {props.children}
        </span>
      </label>
    </div>
  );
}
