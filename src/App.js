'use strict';

import React from 'react';
import Nav from './components/Nav';
import ViewContainer from './components/ViewContainer';

import Start from './views/Start';
import Resume from './views/Resume';
import Pause from './views/Pause';
import About from './views/About';
import FAQ from './views/FAQ';

class App extends React.Component {
  constructor() {
    super();

    this.state = {
      view: 'Start',
      test: 'testing'
    };

    this.handleViewChange = this.handleViewChange.bind(this);
  }

  handleViewChange(view) {
    this.setState({
      view: view
    });
  }

  render() {
    return (
      <div className="App">
        {/* Show "test mode" if not in development */}
        {process.env.NODE_ENV !== 'production' && (
          <div className="test-mode-banner">TEST MODE</div>
        )}
        <Nav handleViewChange={this.handleViewChange} view={this.state.view} />
        <div className="container">
          <ViewContainer view={this.state.view}>
            <About viewName="About" />
            <Start viewName="Start" />
            <Resume viewName="Resume" />
            <Pause viewName="Pause" />
            <FAQ viewName="FAQ" />
          </ViewContainer>
        </div>
      </div>
    );
  }
}

export default App;
