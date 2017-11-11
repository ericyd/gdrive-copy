'use strict';

import React from 'react';

export default function Nav(props) {
  const buttons = ['About', 'Start', 'Resume', 'Pause', 'FAQ'];

  function handleViewChange(e) {
    props.handleViewChange(e.target.name);
  }

  return (
    // svelte version
    // <nav>
    //     <section class="header-container">
    //         {{#each views as view}}
    //             <button role="button"
    //                 on:click='fire("click", {view})'
    //                 name='{{view.id}}'
    //                 class="tabLink btn--nav {{active === view.id ? 'active' : ''}}"
    //                 id="{{view.id}}-button"
    //                 href="#">{{view.title}}</button>
    //         {{/each}}
    //     </section>
    // </nav>
    <nav className="nav">
      <section class="header-container">
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
              onClick={handleViewChange}
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
  handleViewChange: React.PropTypes.func.isRequired,
  view: React.PropTypes.string.isRequired
};
