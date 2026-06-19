'use client';

import { useState } from 'react';
import { DriveData, MEALS, MEAL_LABELS } from '@/types';
import { parseDateKey } from '@/lib/date';

interface Props {
  open: boolean;
  data: DriveData;
  onJumpToDay: (date: Date) => void;
}

export function SearchPanel({ open, data, onJumpToDay }: Props) {
  const [query, setQuery] = useState('');

  if (!open) return null;

  const q = query.trim().toLowerCase();
  const matches: { day: string; entry: DriveData['logs'][string][number] }[] = [];

  if (q) {
    Object.keys(data.logs)
      .sort()
      .reverse()
      .forEach((day) => {
        (data.logs[day] || []).forEach((entry) => {
          if (entry.food.toLowerCase().includes(q) || (entry.notes || '').toLowerCase().includes(q)) {
            matches.push({ day, entry });
          }
        });
      });
  }

  return (
    <div className="search-panel">
      <div className="eyebrow">Search all entries</div>
      <div className="search-input-wrap">
        <i className="ti ti-search" aria-hidden="true" />
        <input
          type="text"
          className="search-input"
          placeholder="Search food names…"
          autoComplete="off"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          autoFocus
        />
      </div>

      <div className="search-results">
        {q && matches.length === 0 && <div className="search-empty">No entries found for &quot;{query}&quot;</div>}

        {matches.slice(0, 50).map(({ day, entry }, i) => {
          const dayLabel = parseDateKey(day).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
          return (
            <div
              key={`${day}-${i}`}
              className="search-result-entry"
              onClick={() => onJumpToDay(parseDateKey(day))}
            >
              <span className="search-date">{dayLabel}</span>
              <div className="entry-body">
                <div className="entry-food">
                  {entry.food}{' '}
                  {entry.meal && MEALS.includes(entry.meal) && (
                    <span className={`meal-tag tag-${entry.meal}`} style={{ marginLeft: 6 }}>
                      {MEAL_LABELS[entry.meal]}
                    </span>
                  )}
                </div>
                {entry.notes && <div className="entry-notes" style={{ marginTop: 2 }}>{entry.notes}</div>}
              </div>
              <span className="entry-qty">{entry.qty}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
