/**
 * Basic panel to hold content
 */
'use strict';

import React from 'react';
import PropTypes from 'prop-types';
import Paper from 'material-ui/Paper';

export default function Alert(props) {
  return (
    <Paper zDepth={1}>
      <div className={['alert', props.className].join(' ')}>
        {props.label && (
          <h3>
            {props.icon}
            {props.label}
          </h3>
        )}
        {props.children}
      </div>
    </Paper>
  );
}

Alert.propTypes = {
  label: PropTypes.string
};
