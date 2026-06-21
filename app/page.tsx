'use client';

import { useEffect, useRef, useState } from 'react';
import { useFoodLog } from '@/lib/useFoodLog';
import { dateKey, nowTime } from '@/lib/date';
import { LogEntry, QuickButton } from '@/types';

import { Header } from '@/components/Header';
import { DriveBanner } from '@/components/DriveBanner';
import { DayNav } from '@/components/DayNav';
import { QuickAddButtons } from '@/components/QuickAddButtons';
import { QuickButtonModal } from '@/components/QuickButtonModal';
import { LogForm } from '@/components/LogForm';
import { LogList } from '@/components/LogList';
import { EntryModal } from '@/components/EntryModal';
import { SearchPanel } from '@/components/SearchPanel';
import { HistoryPanel } from '@/components/HistoryPanel';
import { Toast, ToastHandle } from '@/components/Toast';

export default function Home() {
  const { data, syncState, isAuthenticated, getDayLogs, saveDayLogs, saveQuickButtons } = useFoodLog();

  const [currentDate, setCurrentDate] = useState(() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
  });

  const [searchOpen, setSearchOpen] = useState(false);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [jsonCopied, setJsonCopied] = useState(false);

  const [quickModalOpen, setQuickModalOpen] = useState(false);
  const [editingQuickIdx, setEditingQuickIdx] = useState<number | null>(null);

  const [entryModalOpen, setEntryModalOpen] = useState(false);
  const [editingEntryIdx, setEditingEntryIdx] = useState<number | null>(null);

  const [prefill, setPrefill] = useState<{ food: string; qty: string } | null>(null);

  const toastRef = useRef<ToastHandle>(null);
  const showToast = (msg: string) => toastRef.current?.show(msg);
  const showUndoToast = (msg: string, onUndo: () => void) =>
    toastRef.current?.showWithAction(msg, 'Undo', onUndo);

  const key = dateKey(currentDate);
  const entries = getDayLogs(key);

  // ── Log form ──
  const handleLog = (entry: LogEntry) => {
    const next = [...entries, entry].sort((a, b) => a.time.localeCompare(b.time));
    saveDayLogs(key, next);
  };

  // ── Entry actions ──
  const handleEditEntry = (index: number) => {
    setEditingEntryIdx(index);
    setEntryModalOpen(true);
  };

  const handleSaveEntry = (updated: LogEntry) => {
    if (editingEntryIdx === null) return;
    const previous = entries[editingEntryIdx];
    const previousEntries = entries;
    const next = [...entries];
    next[editingEntryIdx] = updated;
    next.sort((a, b) => a.time.localeCompare(b.time));
    saveDayLogs(key, next);
    setEntryModalOpen(false);
    showUndoToast('Entry updated', () => saveDayLogs(key, previousEntries));
  };

  const handleDeleteEntry = () => {
    if (editingEntryIdx === null) return;
    const previousEntries = entries;
    const next = entries.filter((_, i) => i !== editingEntryIdx);
    saveDayLogs(key, next);
    setEntryModalOpen(false);
    showUndoToast('Entry deleted', () => saveDayLogs(key, previousEntries));
  };

  const handleDeleteEntryDirect = (index: number) => {
    const previousEntries = entries;
    const next = entries.filter((_, i) => i !== index);
    saveDayLogs(key, next);
    showUndoToast('Entry deleted', () => saveDayLogs(key, previousEntries));
  };

  const handleDuplicateEntry = (index: number) => {
    const copy = { ...entries[index], time: nowTime() };
    const next = [...entries, copy].sort((a, b) => a.time.localeCompare(b.time));
    saveDayLogs(key, next);
    showToast('Entry duplicated');
  };

  // ── Quick buttons ──
  const handleUseQuickButton = (button: QuickButton) => {
    setPrefill({ food: button.food, qty: button.qty });
  };

  const handleNewQuickButton = () => {
    setEditingQuickIdx(null);
    setQuickModalOpen(true);
  };

  const handleEditQuickButton = (index: number) => {
    setEditingQuickIdx(index);
    setQuickModalOpen(true);
  };

  const handleSaveQuickButton = (button: QuickButton) => {
    const buttons = [...data.quickButtons];
    if (editingQuickIdx !== null) {
      buttons[editingQuickIdx] = button;
    } else {
      buttons.push(button);
    }
    saveQuickButtons(buttons);
    setQuickModalOpen(false);
    showToast(editingQuickIdx !== null ? 'Button updated' : 'Button added');
  };

  const handleDeleteQuickButton = () => {
    if (editingQuickIdx === null) return;
    const previousButtons = data.quickButtons;
    const buttons = data.quickButtons.filter((_, i) => i !== editingQuickIdx);
    saveQuickButtons(buttons);
    setQuickModalOpen(false);
    showUndoToast('Button removed', () => saveQuickButtons(previousButtons));
  };

  // ── Copy JSON ──
  const handleCopyJson = async () => {
    if (entries.length === 0) {
      showToast('Nothing logged for this day');
      return;
    }
    const json = JSON.stringify({ date: key, entries }, null, 2);
    try {
      await navigator.clipboard.writeText(json);
      setJsonCopied(true);
      showToast('Day log copied as JSON');
      setTimeout(() => setJsonCopied(false), 2000);
    } catch {
      showToast('Copy failed — try again');
    }
  };

  // ── Panel toggles (mutually exclusive) ──
  const toggleSearch = () => {
    setSearchOpen((v) => !v);
    setHistoryOpen(false);
  };
  const toggleHistory = () => {
    setHistoryOpen((v) => !v);
    setSearchOpen(false);
  };

  const jumpToDay = (date: Date) => {
    setCurrentDate(date);
    setSearchOpen(false);
    setHistoryOpen(false);
  };

  // Close the search/history slide-out on Escape
  useEffect(() => {
    if (!searchOpen && !historyOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setSearchOpen(false);
        setHistoryOpen(false);
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [searchOpen, historyOpen]);

  return (
    <div className="app">
      <Header
        syncState={syncState}
        searchOpen={searchOpen}
        historyOpen={historyOpen}
        onToggleSearch={toggleSearch}
        onToggleHistory={toggleHistory}
        onCopyJson={handleCopyJson}
        jsonCopied={jsonCopied}
      />

      {!isAuthenticated && <DriveBanner />}

      <div className="layout">
        <div className="layout-left">
          <div className="layout-left-sticky">
            <DayNav currentDate={currentDate} onChange={setCurrentDate} />

            <QuickAddButtons
              buttons={data.quickButtons}
              onUse={handleUseQuickButton}
              onEdit={handleEditQuickButton}
              onNew={handleNewQuickButton}
            />

            <LogForm onLog={handleLog} prefill={prefill} onPrefillConsumed={() => setPrefill(null)} />
          </div>
        </div>

        <div className="layout-right">
          <div className="log-section">
            <div className="log-header">
              <span className="eyebrow">{dateKey(currentDate) === dateKey(new Date()) ? "Today's log" : 'Log'}</span>
              {entries.length > 0 && (
                <span className="count-pill">
                  {entries.length} {entries.length === 1 ? 'entry' : 'entries'}
                </span>
              )}
            </div>
            <div className="log-scroll">
              <LogList
                entries={entries}
                onEdit={handleEditEntry}
                onDuplicate={handleDuplicateEntry}
                onDelete={handleDeleteEntryDirect}
              />
            </div>
          </div>
        </div>
      </div>

      {(searchOpen || historyOpen) && (
        <div
          className="side-panel-overlay"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setSearchOpen(false);
              setHistoryOpen(false);
            }
          }}
        >
          <div className="side-panel">
            <button
              className="side-panel-close"
              onClick={() => {
                setSearchOpen(false);
                setHistoryOpen(false);
              }}
              aria-label="Close panel"
            >
              <i className="ti ti-x" aria-hidden="true" />
            </button>
            <SearchPanel open={searchOpen} data={data} onJumpToDay={jumpToDay} />
            <HistoryPanel open={historyOpen} data={data} currentDate={currentDate} onSelectDay={jumpToDay} />
          </div>
        </div>
      )}

      <QuickButtonModal
        open={quickModalOpen}
        editing={editingQuickIdx !== null ? data.quickButtons[editingQuickIdx] : null}
        onClose={() => setQuickModalOpen(false)}
        onSave={handleSaveQuickButton}
        onDelete={handleDeleteQuickButton}
      />

      <EntryModal
        open={entryModalOpen}
        entry={editingEntryIdx !== null ? entries[editingEntryIdx] : null}
        onClose={() => setEntryModalOpen(false)}
        onSave={handleSaveEntry}
        onDelete={handleDeleteEntry}
      />

      <Toast ref={toastRef} />
    </div>
  );
}