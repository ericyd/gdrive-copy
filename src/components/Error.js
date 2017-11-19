'use strict';

import React from 'react';
import PropTypes from 'prop-types';
import Alert from './Alert';

export default function Error(props) {
  return (
    <Alert label="Error" className="alert--error">
      {props.children}
    </Alert>
  );
}

// Error.propTypes = {};
