'use strict';

import React from 'react';

export default function About() {
  return (
    <main className="doc">
      <h2>About</h2>

      <p>
        This app provides the capability to copy a Google Drive folder. It will
        copy all contents of the folder and preserve the internal structure of
        the files and folders. Optionally, you can also copy any sharing
        permissions over to the new folder.
      </p>

      <p>
        If a folder is nested within other folders of your Google Drive, it is
        often convenient to make a new copy in the same location. This is the
        default behavior. However, if you would rather have the copy appear at
        the top level of your Google Drive, you can select to place your copy at
        the Root level.
      </p>

      <p>
        This app is built and maintained for free by one person, and is in no
        way affiliated with or supported by Google (other than hosting, which
        they provide for free). While reporting issues is appreciated, please be
        aware that the developer's time is limited, and this product does not
        come with any warranties or guarantees of service.
      </p>

      <p>
        This app is licensed under the{' '}
        <a href="https://opensource.org/licenses/MIT" target="_blank">
          MIT License
        </a>
        . Feel free to reuse or distribute this code in any way you see fit. You
        can find the source code on{' '}
        <a href="http://www.github.com/ericyd/gdrive-copy" target="_blank">
          Github
        </a>
        .
      </p>

      <p>
        If you would like to run your own version of the code but do not come
        from a technical background, you can follow{' '}
        <a
          href="https://github.com/ericyd/gdrive-copy/blob/master/howto_for_non-developers.md"
          target="_blank"
        >
          this guide
        </a>{' '}
        to launch your own, private version of the app.
      </p>

      <h2>Getting started</h2>

      <p>
        To get started, simply select your folder and choose a new name, then
        select Copy Folder!
        <br />
        If the folder copy get's stuck, simply use the "Resume prior folder
        copy" button, then select the copy of your folder.
      </p>

      <h2>Privacy</h2>

      <p>
        Please see the{' '}
        <a
          href="https://github.com/ericyd/gdrive-copy/blob/master/PRIVACY_POLICY.md"
          target="_blank"
        >
          Privacy Policy
        </a>
        .
      </p>
      <p>
        This app does not store any data relating to your account or Google
        Drive contents.
      </p>

      <h2>When issues arise...</h2>

      <p>
        Sometimes this app will get stuck (sorry!). To resume a folder copy that
        is in-progress, but paused for whatever reason, simply select the{' '}
        <b>
          <i>new, incomplete copy</i>
        </b>{' '}
        of the folder and select "Resume copying".
      </p>
    </main>
  );
}
