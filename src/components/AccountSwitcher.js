'use strict';

import React from 'react';
import PropTypes from 'prop-types';

export default class AccountSwitcher extends React.Component {
  constructor() {
    super();
    this.state = {
      email: null
    };
    this.loginURL =
      process.env.NODE_ENV === 'production'
        ? 'https://accounts.google.com/AccountChooser?continue=https://script.google.com/macros/s/AKfycbxbGNGajrxv-HbX2sVY2OTu7yj9VvxlOMOeQblZFuq7rYm7uyo/exec'
        : 'https://accounts.google.com/AccountChooser?continue=https://script.google.com/macros/s/AKfycbzKJQO5CBf7WDmrYo8FGDb20YWfoIyUZZhsbF844SI/dev';
  }

  // get user email for logged in user
  componentDidMount() {
    const _this = this;
    if (process.env.NODE_ENV === 'production') {
      google.script.run
        .withSuccessHandler(function(email) {
          _this.setState({
            email: email
          });
        })
        .withFailureHandler(function(err) {
          console.log("couldn't get email");
        })
        .getUserEmail();
    } else {
      setTimeout(function() {
        _this.setState({
          email: 'eric@ericyd.com'
        });
      }, 1000);
    }
  }

  render() {
    return (
      <div>
        <div>Logged in as {this.state.email}</div>
        <a target="_blank" href={this.loginURL}>
          Click here
        </a>{' '}
        to log in with a different account.
      </div>
    );
  }
}

// Success.propTypes = {};
