import React from 'react';
import PropTypes from 'prop-types';

// Credit: https://iconmonstr.com/star-3/
export default function Star(props) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={props.width}
      height={props.height}
      viewBox="0 0 24 24"
      aria-hidden="true"
    >
      <path d="M12 .587l3.668 7.568 8.332 1.151-6.064 5.828 1.48 8.279-7.416-3.967-7.417 3.967 1.481-8.279-6.064-5.828 8.332-1.151z" />
    </svg>
  );
}

Star.PropTypes = {
  width: PropTypes.string,
  height: PropTypes.string
};
