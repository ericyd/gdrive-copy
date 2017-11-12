'use strict';

import React, { Component } from 'react';
import Nav from './components/Nav';
import ViewContainer from './components/ViewContainer';

class App extends Component {
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
        <Nav handleViewChange={this.handleViewChange} view={this.state.view} />
        <div className="container">
          <ViewContainer view={this.state.view} />
        </div>
      </div>
    );
  }
}

export default App;