'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useSession } from 'next-auth/react';
import { DriveData, LogEntry, QuickButton } from '@/types';

type SyncState = 'idle' | 'loading' | 'syncing' | 'ok' | 'error';

const emptyData = (): DriveData => ({
  logs: {},
  quickButtons: [],
  updatedAt: new Date().toISOString(),
});

export function useFoodLog() {
  const { data: session, status: authStatus } = useSession();
  const [data, setData] = useState<DriveData>(emptyData());
  const [syncState, setSyncState] = useState<SyncState>('idle');
  const saveTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  const loadedOnce = useRef(false);

  // Load from Drive once authenticated
  useEffect(() => {
    if (authStatus !== 'authenticated' || loadedOnce.current) return;
    loadedOnce.current = true;

    setSyncState('loading');
    fetch('/api/logs')
      .then((res) => {
        if (!res.ok) throw new Error('Failed to load');
        return res.json();
      })
      .then((remote: DriveData) => {
        setData(remote);
        setSyncState('ok');
      })
      .catch(() => setSyncState('error'));
  }, [authStatus]);

  const persist = useCallback((next: DriveData) => {
    if (saveTimeout.current) clearTimeout(saveTimeout.current);
    saveTimeout.current = setTimeout(async () => {
      setSyncState('syncing');
      try {
        const res = await fetch('/api/logs', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(next),
        });
        if (!res.ok) throw new Error('Save failed');
        setSyncState('ok');
      } catch {
        setSyncState('error');
      }
    }, 1200); // debounce
  }, []);

  const updateData = useCallback(
    (updater: (prev: DriveData) => DriveData) => {
      setData((prev) => {
        const next = updater(prev);
        persist(next);
        return next;
      });
    },
    [persist]
  );

  const getDayLogs = useCallback(
    (dateKey: string): LogEntry[] => data.logs[dateKey] ?? [],
    [data]
  );

  const saveDayLogs = useCallback(
    (dateKey: string, entries: LogEntry[]) => {
      updateData((prev) => ({
        ...prev,
        logs: { ...prev.logs, [dateKey]: entries },
      }));
    },
    [updateData]
  );

  const saveQuickButtons = useCallback(
    (buttons: QuickButton[]) => {
      updateData((prev) => ({ ...prev, quickButtons: buttons }));
    },
    [updateData]
  );

  return {
    data,
    syncState,
    isAuthenticated: authStatus === 'authenticated',
    isAuthLoading: authStatus === 'loading',
    getDayLogs,
    saveDayLogs,
    saveQuickButtons,
  };
}
