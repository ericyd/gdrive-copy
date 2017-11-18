'use strict';

import React from 'react';
import PropTypes from 'prop-types';

export default function ViewContainer(props) {
  const children = React.Children.map(props.children, function(child) {
    console.log(child);
    if (props.view === child.type.name) {
      return React.cloneElement(child);
    }
  });
  return <div>{children}</div>;
}

ViewContainer.propTypes = {
  view: PropTypes.string
};
