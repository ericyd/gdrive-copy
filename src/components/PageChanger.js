/**
 * A simple wrapper that will only show the child element
 * whose "stepNum" prop === the activeStep prop
 */
'use strict';

import React from 'react';
import PropTypes from 'prop-types';

export default function PageChanger(props) {
  const children = React.Children.map(props.children, function(child) {
    if (props.activeStep === child.props.stepNum) {
      return React.cloneElement(child);
    }
  });
  return <div>{children}</div>;
}

PageChanger.propTypes = {
  activeStep: PropTypes.number
};
