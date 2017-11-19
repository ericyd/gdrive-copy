'use strict';

import React from 'react';
import PropTypes from 'prop-types';

export default function Alert(props) {
  return (
    <div className={['alert', props.className].join(' ')}>
      <h4>{props.label}</h4>
      {props.children}
    </div>
  );
}

Alert.propTypes = {
  label: PropTypes.string
};
