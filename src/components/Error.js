'use strict';

import React from 'react';
import PropTypes from 'prop-types';
import Alert from './Alert';
import Warning from './icons/Warning';

export default function Error(props) {
  return (
    <Alert
      label="Error"
      className="alert--error"
      icon={<Warning width="1em" height="1em" />}
    >
      {props.children}
    </Alert>
  );
}

// Error.propTypes = {};
