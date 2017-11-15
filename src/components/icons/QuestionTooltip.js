import React from 'react';
import QuestionMark from './QuestionMark';

export default function QuestionTooltip(props) {
  return (
    <span tabIndex="10" className="tooltip-toggle" data-tooltip={props.tooltip}>
      <QuestionMark width="1em" height="1em" />
    </span>
  );
}
