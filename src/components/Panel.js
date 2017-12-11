/**
 * Information message container
 */
'use strict';

import React from 'react';
import PropTypes from 'prop-types';
import Alert from './Alert';

export default function Panel(props) {
  return (
    <Alert label={props.label} className="alert--neutral">
      {props.children}
    </Alert>
  );
}

Panel.propTypes = {
  label: PropTypes.string
};
