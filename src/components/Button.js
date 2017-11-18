'use strict';

import React from 'react';

export default function Button(props) {
  return (
    <button
      type="button"
      key={props.text}
      name={props.text}
      className={['btn', props.className].join(' ')}
      onClick={props.handleClick}
    >
      {props.text}
    </button>
  );
}

Button.propTypes = {
  text: PropTypes.string,
  className: PropTypes.string,
  handleClick: PropTypes.func
};
