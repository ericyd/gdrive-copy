/**
 * Holds three pre-defined list items:
 * - donate form button
 * - Star on github button
 * - rate and review link
 */
'use strict';

import React from 'react';
import Panel from './Panel';
import Star from './icons/Star';
import Divider from 'material-ui/Divider';

export default function Appreciation(props) {
  return (
    <Panel label="Want to show your appreciation?">
      <div className="list-item-large">
        The developer does not upkeep this project anymore. However, if you'd
        like to show your support in the form of monetary contribution, please
        consider giving to{' '}
        <a href="https://secure.actblue.com/donate/ms_blm_homepage_2019" target="_blank">
          Black Lives Matter Global Network
        </a>
        .
      </div>
      <Divider />
      <div className="list-item-large">
        or, you can
        <a
          className="github-button"
          href="https://github.com/ericyd/gdrive-copy"
          aria-label="Star ericyd/gdrive-copy on GitHub"
          target="_blank"
        >
          <Star width="1em" height="1em" /> Star
        </a>{' '}
        on Github
      </div>
    </Panel>
  );
}
