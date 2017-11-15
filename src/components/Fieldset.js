'use strict';

import React from 'react';

export default function Fieldset(props) {
  return (
    <fieldset>
      <legend>{props.legend}</legend>
      {props.children}
    </fieldset>
  );
}
