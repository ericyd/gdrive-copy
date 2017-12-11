import React from 'react';
import Icon from './Icon';
import './spinner.css';

export default function Spinner(props) {
  return (
    <span>
      <Icon {...props} className="spinner" viewBox="0 0 100 100">
        {/* Major arc */}
        <path
          id="path1"
          strokeWidth="3px"
          stroke="#000"
          fill="none"
          d="M10.123310854875854 25.123310854875854 a47 47 0 1 0 15 -15"
          transform="rotate(35 50 50)"
        />

        {/* Minor arc */}
        <path
          id="path2"
          strokeWidth="3px"
          stroke="none"
          fill="none"
          d="M10.123310854875854 25.123310854875854 a47 47 1 0 1 15 -15"
          transform="rotate(35 50 50)"
        />
      </Icon>
    </span>
  );
}
