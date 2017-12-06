'use strict';

import React from 'react';
import { Picker, getScript } from './util/picker';
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

    /**
     * A callback function that extracts the chosen document's metadata from the
     * response object. For details on the response object, see
     * https://developers.google.com/picker/docs/result
     *
     * @param {object} data The response object.
     */
    this.pickerCallback = function(data) {
      var action = data[google.picker.Response.ACTION];

      if (action == google.picker.Action.PICKED) {
        var doc = data[google.picker.Response.DOCUMENTS][0];
        this.setState({
          srcFolderID: doc[google.picker.Document.ID],
          srcParentID: doc[google.picker.Document.PARENT_ID],
          srcFolderName: doc[google.picker.Document.NAME]
        });
      } else if (action == google.picker.Action.CANCEL) {
        google.script.host.close();
      }
    };
  }

  /**
   * Load Google API script for the Picker widget
   * Set global reference to picker so it can be passed down to the views
   */
  componentWillMount() {
    this.picker = new Picker(this.pickerCallback);
    getScript('https://apis.google.com/js/api.js', this.picker.onApiLoad);
  }

  render() {
    const tabLabelStyle = { color: '#383838' };
    return (
      <MuiThemeProvider>
        {process.env.NODE_ENV !== 'production' && (
          <div className="test-mode-banner">TEST MODE</div>
        )}
        <AccountSwitcher />
        <Tabs
          // this is what keeps everything centered
          // if I want the bar to span and the contents to be contained, I can use the
          // contentContainerClassName="container" property
          className="container"
          tabItemContainerStyle={{ backgroundColor: '#f7f7f7' }}
          initialSelectedIndex={1}
        >
          <Tab label="About" style={tabLabelStyle}>
            <About />
          </Tab>

          <Tab label="Start" style={tabLabelStyle}>
            <Start picker={this.picker} />
          </Tab>

          <Tab label="Resume" style={tabLabelStyle}>
            <Resume picker={this.picker} />
          </Tab>

          <Tab label="Pause" style={tabLabelStyle}>
            <Pause />
          </Tab>

          <Tab label="FAQ" style={tabLabelStyle}>
            <FAQ />
          </Tab>
        </Tabs>
      </MuiThemeProvider>
    );
  }
}
