/**
 * A static semi-opaque overlay with a spinner and optional message
 * to indicate loading, processing, or other wait times.
 */
'use strict';

import React from 'react';
import Spinner from './icons/Spinner';
import PropTypes from 'prop-types';

export default function Overlay(props) {
  // fixed position overlay seems to work better with inline styles
  // credits: //https://css-tricks.com/quick-css-trick-how-to-center-an-object-exactly-in-the-center/
  return (
    <div>
      {/* overlay */}
      <div
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          backgroundColor: '#fff',
          opacity: 0.5,
          zIndex: 1000
        }}
      />
      {/* Message */}
      <div
        style={{
          position: 'fixed',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          opacity: 1,
          zIndex: 1001,
          textAlign: 'center',
          backgroundColor: '#fff',
          padding: '2em',
          boxShadow: '0px 0px 20px 0px #bababa'
        }}
      >
        <Spinner width="4em" height="4em" />
        <div>{props.label}</div>
      </div>
    </div>
  );
}

Overlay.propTypes = {
  label: PropTypes.string
};
