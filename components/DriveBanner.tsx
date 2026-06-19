'use client';

import { signIn } from 'next-auth/react';

export function DriveBanner() {
  return (
    <div className="drive-banner">
      <i className="ti ti-brand-google-drive" aria-hidden="true" />
      <div className="drive-banner-text">
        <strong>Sync across devices</strong>
        <span>Connect Google Drive to keep your log in sync everywhere.</span>
      </div>
      <button className="drive-connect-btn" onClick={() => signIn('google')}>
        Connect
      </button>
    </div>
  );
}
