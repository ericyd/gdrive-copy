'use strict';

import React from 'react';
import PropTypes from 'prop-types';
import Alert from './Alert';

export default function Success(props) {
  return (
    <Alert label="Success!" className="alert--success">
      {props.children}
      <a 
        class="github-button" 
        href="https://github.com/ericyd/gdrive-copy" 
        data-icon="octicon-star" 
        data-size="large" 
        aria-label="Star ericyd/gdrive-copy on GitHub">
        Star
      </a>
    </Alert>
  );
}

// Success.propTypes = {};
