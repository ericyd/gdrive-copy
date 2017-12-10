/**
 * Simple button with popover to indicate the email address associated
 * with the account currently in use
 */
'use strict';

import React from 'react';
import RaisedButton from 'material-ui/RaisedButton';
import Popover from 'material-ui/Popover';
import Paper from 'material-ui/Paper';

// Consider adding thumbnail of google photo
// http://picasaweb.google.com/data/entry/api/user/[EMAIL_ADDRESS]?alt=json
// response.gphoto$thumbnail.St
// response.gphoto$nickname.St
export default class AccountSwitcher extends React.Component {
  constructor() {
    super();
    this.state = {
      email: null,
      isOpen: false,
      error: false
    };
    this.loginURL =
      process.env.NODE_ENV === 'production'
        ? 'https://accounts.google.com/AccountChooser?continue=https://script.google.com/macros/s/AKfycbxbGNGajrxv-HbX2sVY2OTu7yj9VvxlOMOeQblZFuq7rYm7uyo/exec'
        : 'https://accounts.google.com/AccountChooser?continue=https://script.google.com/macros/s/AKfycbzKJQO5CBf7WDmrYo8FGDb20YWfoIyUZZhsbF844SI/dev';

    this.handleClick = this.handleClick.bind(this);
    this.handleRequestClose = this.handleRequestClose.bind(this);
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
          _this.setState({ error: true });
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

  handleClick(e) {
    this.setState({
      isOpen: !this.state.isOpen,
      anchorEl: e.currentTarget
    });
  }

  handleRequestClose() {
    this.setState({
      isOpen: false
    });
  }

  render() {
    return (
      <div className="account-switcher">
        <RaisedButton label="Account Info" onClick={this.handleClick} />
        <Popover
          open={this.state.isOpen}
          anchorEl={this.state.anchorEl}
          anchorOrigin={{ horizontal: 'middle', vertical: 'bottom' }}
          targetOrigin={{ horizontal: 'right', vertical: 'top' }}
          onRequestClose={this.handleRequestClose}
        >
          <Paper style={{ padding: '1.5em', lineHeight: '1.5em' }}>
            {this.state.error ? (
              <div>Error retrieving account email</div>
            ) : (
              <div>Logged in as {this.state.email}</div>
            )}
            <a target="_blank" href={this.loginURL}>
              Click here
            </a>{' '}
            to log in with a different account.
          </Paper>
        </Popover>
      </div>
    );
  }
}
