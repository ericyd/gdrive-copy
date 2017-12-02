'use strict';

import React from 'react';
import PropTypes from 'prop-types';
import Alert from './Alert';
import Checkmark from './icons/Checkmark';
import Star from './icons/Star';

export default function Success(props) {
  return (
    <Alert
      label={'Success! ' + props.msg}
      className="alert--success"
      icon={<Checkmark width="1em" height="1em" />}
    >
      {props.children}
    </Alert>
  );
}

// Success.propTypes = {};
