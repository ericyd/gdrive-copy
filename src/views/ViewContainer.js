'use strict';

import React, { Component } from 'react';
import Start from './Start';
import Resume from './Resume';
import Pause from './Pause';
import About from './About';
import FAQ from './FAQ';

export default class ViewContainer extends Component {
  constructor() {
    super();

    // this will contain the Plotter state when it unmounts,
    // and send it back to Plotter when it re-mounts
    this.state = {};

    this.handlePlotterUnmount = this.handlePlotterUnmount.bind(this);
  }

  handlePlotterUnmount(state) {
    this.setState(state);
  }

  render() {
    switch (this.props.view) {
      case 'FAQ':
        return <FAQ />;
      case 'About':
        return <About />;
      case 'Pause':
        return <Pause />;
      case 'Resume':
        return <Resume />;
      default:
        return <Start />;
      // <Plotter
      //   handleUnmount={this.handlePlotterUnmount}
      //   initialState={this.state}
      // />
    }
  }
}

ViewContainer.propTypes = {
  view: React.PropTypes.string
};
