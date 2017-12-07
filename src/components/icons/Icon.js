import React from 'react';
import PropTypes from 'prop-types';

export default function Icon(props) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      className={props.className}
      width={props.width}
      height={props.height}
      viewBox={props.viewBox}
      aria-hidden="true"
    >
      {props.children}
    </svg>
  );
}

Icon.propTypes = {
  width: PropTypes.string,
  height: PropTypes.string,
  viewBox: PropTypes.string
};

Icon.defaultProps = {
  width: '1em',
  height: '1em',
  viewBox: '0 0 24 24'
};
