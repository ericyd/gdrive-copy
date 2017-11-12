'use strict';

import React from 'react';

export default function FAQ() {
  // Thanks to https://buttons.github.io/ for the Issues button
  return (
    <main className="doc">
      <a name="top" />
      <ul>
        <li>
          <a href="#longerThan2Mins">
            The copying has been paused longer than 2 minutes and it isn't
            complete. What do I do?
          </a>
        </li>
        <li>
          <a href="#copyBetweenDomains">
            Can I use this app to copy a folder between domains?
          </a>
        </li>
        <li>
          <a href="#whenIsItDone">How do I know when it is done?</a>
        </li>
        <li>
          <a href="#notEverythingCopied">
            It didn't copy everything - what do I do?
          </a>
        </li>
        <li>
          <a href="#multipleAccounts">
            How do I sign into a different account with this app?
          </a>
        </li>
        <li>
          <a href="#infiniteLoop">
            HELP! The copying is stuck in an infinite loop! What do I do?
          </a>
        </li>
        <li>
          <a href="#uninstall">
            How do I unintall the app and remove all permissions?
          </a>
        </li>
        <li>
          <a href="#openissue">How do I report a bug in the app?</a>
        </li>
      </ul>
      <h4>
        <a name="longerThan2Mins" />The copying has been paused longer than 2
        minutes and it isn't complete. What do I do?
      </h4>
      <div className="description">
        When the app stops, you can use the "Resume" button to restart the
        copying. When selecting the folder to resume, you must select the{' '}
        <b>in-progress</b> folder, <b>not</b> the original.<br />
        <br />
        For example, if you are creating a copy of "Folder A" called "Copy of
        Folder A", you should select "Copy of Folder A" when you resume the
        copying. Selecting the original folder will return an error.
      </div>
      <a href="#top">Top</a>
      <h4>
        <a name="copyBetweenDomains" />Can I use this app to copy a folder
        between domains?
      </h4>
      <div className="description">
        Yes! Follow the steps below:
        <ol>
          <li>Log into the account that owns the folder ("Account 1")</li>
          <li>
            Share the folder with the domain to which you'd like to copy
            ("Account 2")
          </li>
          <li>Open an private/incognito window and log into Account 2</li>
          <li>
            Go to the "Shared with me" section, right click the folder, and
            select "Add to Drive"
          </li>
          <li>Open the app, and select the folder that has been shared</li>
          <li>Create a copy and Account 2 will now be the owner</li>
        </ol>
      </div>
      <a href="#top">Top</a>
      <h4>
        <a name="whenIsItDone" />How do I know when it is done?
      </h4>
      <div className="description">
        You will know it is complete when the Copy Log says "Complete" in cell
        C2. In addition, the cell will highlight green.
      </div>
      <a href="#top">Top</a>
      <h4>
        <a name="notEverythingCopied" />It didn't copy everything - what do I
        do?
      </h4>
      <div className="description">
        Typically this is due to server errors encountered while copying. You
        should be able to do one of the following to resolve this situation:
        <ol>
          <li>
            Audit the Copy Log for any errors, and manually copy those files
          </li>
          <li>
            Restart the copy process. Typically, it is best if you wait a few
            hours if you ran into significant copying errors
          </li>
        </ol>
      </div>
      <a href="#top">Top</a>
      <h4>
        <a name="multipleAccounts" />How do I sign into a different account with
        this app?
      </h4>
      <div className="description">
        There isn't a handy Account Switcher like you'll find in native Google
        Apps.* However, you can try to use the link at the top of the page which
        should re-direct you and allow you to sign if from a different account.<br
        />
        <br />
        If that fails, I would recommend signing in from another browser, or
        opening an incognito/private window and accessing the app that way.
        <br />
        <br />*If you think this is a good feature, please feel free to open an
        <span className="github-button-wrapper">
          <a
            className="github-button"
            href="https://github.com/ericyd/gdrive-copy/issues"
            data-icon="octicon-issue-opened"
            data-style="mega"
            aria-label="Issue ericyd/gdrive-copy on GitHub"
          >
            Issue
          </a>
        </span>{' '}
        on Github., or better yet, contribute to the repo! 'Cuz I don't know how
        to add an Account Switcher, otherwise I would have done it already :)
      </div>
      <a href="#top">Top</a>
      <h4>
        <a name="infiniteLoop" />HELP! The copying is stuck in an infinite loop!
        What do I do?
      </h4>
      <div className="description">
        Please use the "Pause" function built into the app and{' '}
        <a href="https://github.com/ericyd/gdrive-copy/issues" target="_blank">
          report the bug
        </a>
      </div>
      <a href="#top">Top</a>
      <h4>
        <a name="uninstall" />How do I unintall the app and remove all
        permissions?
      </h4>
      <div className="description">
        To quote{' '}
        <a href="https://webapps.stackexchange.com/questions/30841/how-do-i-remove-permission-from-an-app-that-i-gave-google-oauth-access-to">
          the excellent answer on stackexchange:
        </a>
        <ol>
          <li>
            Go to <a href="https://accounts.google.com">accounts.google.com</a>
          </li>
          <li>
            Under "Sign-in &amp; security" tab click "Connected apps &amp;
            sites"
          </li>
          <li>
            Under the section "Apps connected to your account", click on MANAGE
            APPS:
          </li>
          <li>Select app you want &amp; click REMOVE button</li>
        </ol>
      </div>
      <a href="#top">Top</a>
      <h4>
        <a name="openissue" />How do I report a bug in the app?
      </h4>
      <div className="description">
        If you have found a bug that is not covered in these FAQs, please open
        an
        <span className="github-button-wrapper">
          <a
            className="github-button"
            href="https://github.com/ericyd/gdrive-copy/issues"
            data-icon="octicon-issue-opened"
            data-style="mega"
            aria-label="Issue ericyd/gdrive-copy on GitHub"
          >
            Issue
          </a>
        </span>{' '}
        on Github.
      </div>
      <a href="#top">Top</a>
    </main>
  );
}
