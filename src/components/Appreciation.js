'use strict';

import React from 'react';
import Panel from './Panel';
import Star from './icons/Star';
import { List, ListItem } from 'material-ui/List';
import Divider from 'material-ui/Divider';

export default function Appreciation(props) {
  return (
    <Panel label="Want to show your appreciation?">
      <List>
        <ListItem>
          <form
            class="no-padding"
            action="https://www.paypal.com/cgi-bin/webscr"
            method="post"
            target="_blank"
          >
            <input type="hidden" name="cmd" value="_s-xclick" />
            <input
              type="hidden"
              name="hosted_button_id"
              value="JUVGC2A5Y4VV6"
            />
            <input
              type="image"
              src="https://www.paypalobjects.com/en_US/i/btn/btn_donateCC_LG.gif"
              border="0"
              name="submit"
              alt="PayPal - The safer, easier way to pay online!"
            />
            <img
              alt=""
              border="0"
              src="https://www.paypalobjects.com/en_US/i/scr/pixel.gif"
              width="1"
              height="1"
            />
          </form>
        </ListItem>
        <Divider />
        <ListItem
          onClick={() => window.open('https://github.com/ericyd/gdrive-copy')}
        >
          <a
            className="github-button"
            href="https://github.com/ericyd/gdrive-copy"
            aria-label="Star ericyd/gdrive-copy on GitHub"
            target="_blank"
          >
            <Star width="1em" height="1em" /> Star
          </a>{' '}
          on Github
        </ListItem>
        <Divider />
        <ListItem
          onClick={() =>
            window.open(
              'https://chrome.google.com/webstore/detail/copy-folder/kfbicpdhiofpicipfggljdhjokjblnhl/reviews'
            )
          }
        >
          <a
            href="https://chrome.google.com/webstore/detail/copy-folder/kfbicpdhiofpicipfggljdhjokjblnhl/reviews"
            target="_blank"
          >
            Rate and review this app
          </a>{' '}
          in the Chrome Web Store
        </ListItem>
      </List>
    </Panel>
  );
}
