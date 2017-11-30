'use strict';

import React from 'react';
import PropTypes from 'prop-types';

export default function Page(props) {
  // stepNum is 0-indexed
  // removing since material-ui/Stepper component indicates status,
  // this is probably superfluous
  // <h2>Step {props.stepNum + 1}</h2>
  return (
    <div>
      <h2>{props.label}</h2>
      {props.children}
    </div>
  );
}

Page.propTypes = {
  label: PropTypes.string,
  stepNum: PropTypes.number
};
