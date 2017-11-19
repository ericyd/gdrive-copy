'use strict';

import React from 'react';
import PropTypes from 'prop-types';

export default function Step(props) {
  return (
    <div>
      <h2>Step {props.stepNum}</h2>
      <h4>{props.label}</h4>
      {props.children}
    </div>
  );
}

Step.propTypes = {
  label: PropTypes.string,
  stepNum: PropTypes.number
};