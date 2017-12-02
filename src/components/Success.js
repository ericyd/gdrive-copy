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
      <a
        className="github-button"
        href="https://github.com/ericyd/gdrive-copy"
        aria-label="Star ericyd/gdrive-copy on GitHub"
        target="_blank"
      >
        <Star width="1em" height="1em" /> Star
      </a>
    </Alert>
  );
}

// Success.propTypes = {};
