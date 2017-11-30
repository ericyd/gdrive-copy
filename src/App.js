'use strict';

import React from 'react';
import Nav from './components/Nav';
import ViewContainer from './components/ViewContainer';
import { getScript, onApiLoad } from './util/picker';
import Start from './views/Start';
import Resume from './views/Resume';
import Pause from './views/Pause';
import About from './views/About';
import FAQ from './views/FAQ';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';

export default class App extends React.Component {
  constructor() {
    super();

    this.state = {
      view: 'Start',
      test: 'testing'
    };

    this.pickerBuilder;

    this.handleViewChange = this.handleViewChange.bind(this);
  }

  handleViewChange(e) {
    this.setState({
      view: e.target.name
    });
  }

  /**
   * Load Google API script for the Picker widget
   * Set global reference to picker so it can be passed down to the views
   */
  componentWillMount() {
    this.pickerBuilder = getScript(
      'https://apis.google.com/js/api.js',
      onApiLoad
    );
  }

  render() {
    return (
      <MuiThemeProvider>
        <div className="App">
          {/* Show "test mode" if not in development */}
          {process.env.NODE_ENV !== 'production' && (
            <div className="test-mode-banner">TEST MODE</div>
          )}
          <Nav
            handleViewChange={this.handleViewChange}
            view={this.state.view}
          />
          <div className="container">
            <ViewContainer view={this.state.view}>
              <About viewName="About" />
              <Start viewName="Start" pickerBuilder={this.pickerBuilder} />
              <Resume viewName="Resume" pickerBuilder={this.pickerBuilder} />
              <Pause viewName="Pause" />
              <FAQ viewName="FAQ" />
            </ViewContainer>
          </div>
        </div>
      </MuiThemeProvider>
    );
  }
}
