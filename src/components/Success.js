/**
 * Success message container
 */
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
      icon={<Checkmark />}
    >
      {props.children}
    </Alert>
  );
}

Success.propTypes = {
  msg: PropTypes.string
};
