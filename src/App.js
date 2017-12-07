'use strict';

import React from 'react';
import { getScript } from './util/picker';
import Start from './views/Start';
import Resume from './views/Resume';
import Pause from './views/Pause';
import About from './views/About';
import FAQ from './views/FAQ';
import AccountSwitcher from './components/AccountSwitcher';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import { Tabs, Tab } from 'material-ui/Tabs';

export default class App extends React.Component {
  constructor() {
    super();

    this.state = {
      isAPILoaded: false
    };
  }

  /**
   * Load Google API script for the Picker widget
   * Set global reference to picker so it can be passed down to the views
   */
  componentWillMount() {
    const _this = this;
    getScript('https://apis.google.com/js/api.js', function() {
      _this.setState({
        isAPILoaded: true
      });
    });
  }

  render() {
    return (
      <MuiThemeProvider>
        <div>
          {process.env.NODE_ENV !== 'production' && (
            <div className="test-mode-banner">TEST MODE</div>
          )}
          <AccountSwitcher />
          <Tabs
            // this is what keeps everything centered
            // if I want the bar to be inside the container too, remove the contentContainerClassName attr and add these
            // className="container"
            // tabItemContainerStyle={{ backgroundColor: '#f7f7f7' }}
            // style={{ color: '#383838' }} // <-- this should go on each Tab component
            contentContainerClassName="container"
            initialSelectedIndex={1}
          >
            <Tab label="About">
              <About />
            </Tab>

            <Tab label="Start">
              <Start isAPILoaded={this.state.isAPILoaded} />
            </Tab>

            <Tab label="Resume">
              <Resume isAPILoaded={this.state.isAPILoaded} />
            </Tab>

            <Tab label="Pause">
              <Pause />
            </Tab>

            <Tab label="FAQ">
              <FAQ />
            </Tab>
          </Tabs>
        </div>
      </MuiThemeProvider>
    );
  }
}
