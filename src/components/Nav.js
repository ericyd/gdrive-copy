'use strict';

import React from 'react';
import PropTypes from 'prop-types';

export default function Nav(props) {
  const buttons = ['About', 'Start', 'Resume', 'Pause', 'FAQ'];

  return (
    <nav className="nav">
      <section className="nav-container">
        {buttons.map(btn => {
          return (
            <button
              type="button"
              key={btn}
              name={btn}
              className={[
                'tabLink',
                'btn--nav',
                props.view === btn ? 'active' : 'nav__btn'
              ].join(' ')}
              onClick={props.handleViewChange}
            >
              {btn}
            </button>
          );
        })}
      </section>
    </nav>
  );
}

Nav.propTypes = {
  handleViewChange: PropTypes.func.isRequired,
  view: PropTypes.string.isRequired
};
