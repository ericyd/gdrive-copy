'use strict';

import React from 'react';
import './Nav.scss';

export default function Nav(props) {
  const buttons = ['Plotter', 'About', 'Credits'];

  function handleViewChange(e) {
    props.handleViewChange(e.target.name);
  }

  return (
    <nav className="nav">
      {buttons.map(btn => {
        return (
          <button
            type="button"
            key={btn}
            name={btn}
            className={props.view === btn ? 'nav__btn--active' : 'nav__btn'}
            onClick={handleViewChange}
          >
            {btn}
          </button>
        );
      })}
    </nav>
  );
}

Nav.propTypes = {
  handleViewChange: React.PropTypes.func.isRequired,
  view: React.PropTypes.string.isRequired
};
