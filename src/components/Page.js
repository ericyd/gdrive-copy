/**
 * A basic view to be used with the PageChanger component
 */
'use strict';

import React from 'react';
import PropTypes from 'prop-types';

export default function Page(props) {
  // stepNum is 0-indexed
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
