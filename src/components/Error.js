'use strict';

import React from 'react';
import PropTypes from 'prop-types';
import Alert from './Alert';
import Warning from './icons/Warning';

export default function Error(props) {
  return (
    <Alert
      label="Oh no! Something went wrong"
      className="alert--error"
      icon={<Warning />}
    >
      {props.children}
    </Alert>
  );
}

// Error.propTypes = {};
