'use strict';

import React from 'react';
import PropTypes from 'prop-types';
import Alert from './Alert';

export default function Success(props) {
  return (
    <Alert label="Success!" className="alert--success">
      {props.children}
    </Alert>
  );
}

// Success.propTypes = {};
