'use strict';

import React from 'react';
import PropTypes from 'prop-types';

export default function ViewContainer(props) {
  const children = React.Children.map(props.children, function(child) {
    if (props.activeStep === child.props.stepNum) {
      return React.cloneElement(child);
    }
  });
  return <div>{children}</div>;
}

ViewContainer.propTypes = {
  activeStep: PropTypes.number
};
