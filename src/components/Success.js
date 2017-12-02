'use strict';

import React from 'react';
import PropTypes from 'prop-types';
import Alert from './Alert';
import Checkmark from './icons/Checkmark';

export default function Success(props) {
  return (
    <Alert
      label={'Success! ' + props.msg}
      className="alert--success"
      icon={<Checkmark width="1em" height="1em" />}
    >
      {props.children}
      <a
        className="github-button"
        href="https://github.com/ericyd/gdrive-copy"
        data-icon="octicon-star"
        data-size="large"
        aria-label="Star ericyd/gdrive-copy on GitHub"
      >
        Star
      </a>
    </Alert>
  );
}

// Success.propTypes = {};
