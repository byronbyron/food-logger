'use client';

import { signIn, signOut, useSession } from 'next-auth/react';

type SyncState = 'idle' | 'loading' | 'syncing' | 'ok' | 'error';

interface Props {
  syncState: SyncState;
  searchOpen: boolean;
  historyOpen: boolean;
  onToggleSearch: () => void;
  onToggleHistory: () => void;
  onCopyJson: () => void;
  jsonCopied: boolean;
}

const SYNC_ICON: Record<SyncState, string> = {
  idle: 'ti-cloud',
  loading: 'ti-refresh',
  syncing: 'ti-refresh',
  ok: 'ti-cloud-check',
  error: 'ti-cloud-x',
};

const SYNC_LABEL: Record<SyncState, string> = {
  idle: '',
  loading: 'Loading…',
  syncing: 'Saving…',
  ok: 'Synced',
  error: 'Sync error',
};

export function Header({
  syncState,
  searchOpen,
  historyOpen,
  onToggleSearch,
  onToggleHistory,
  onCopyJson,
  jsonCopied,
}: Props) {
  const { data: session, status } = useSession();
  const isAuthed = status === 'authenticated';

  return (
    <div className="app-header">
      <div className="app-title">
        <i className="ti ti-salad" aria-hidden="true" />
        Food log
      </div>
      <div className="header-actions">
        {isAuthed && (
          <span className={`sync-status ${syncState}`}>
            <i className={`ti ${SYNC_ICON[syncState]}`} aria-hidden="true" />
            <span>{SYNC_LABEL[syncState]}</span>
          </span>
        )}

        <button
          className="icon-btn"
          onClick={() => (isAuthed ? signOut() : signIn('google'))}
          aria-label={isAuthed ? 'Sign out' : 'Sign in with Google'}
        >
          <i className="ti ti-brand-google-drive" aria-hidden="true" />
          <span>{isAuthed ? 'Disconnect' : 'Connect Drive'}</span>
        </button>

        <button
          className={`icon-btn ${searchOpen ? 'active' : ''}`}
          onClick={onToggleSearch}
          aria-label="Search entries"
        >
          <i className="ti ti-search" aria-hidden="true" />
          <span>Search</span>
        </button>

        <button
          className={`icon-btn ${historyOpen ? 'active' : ''}`}
          onClick={onToggleHistory}
          aria-label="View history"
        >
          <i className="ti ti-calendar-month" aria-hidden="true" />
          <span>History</span>
        </button>

        <button className="icon-btn" onClick={onCopyJson}>
          <i className={`ti ${jsonCopied ? 'ti-braces' : 'ti-braces'}`} aria-hidden="true" />
          <span>{jsonCopied ? 'Copied!' : 'Copy JSON'}</span>
        </button>
      </div>
    </div>
  );
}
