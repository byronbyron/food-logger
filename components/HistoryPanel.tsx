'use client';

import { DriveData } from '@/types';
import { dateKey } from '@/lib/date';

interface Props {
  open: boolean;
  data: DriveData;
  currentDate: Date;
  onSelectDay: (date: Date) => void;
}

const DOW_LABELS = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];

export function HistoryPanel({ open, data, currentDate, onSelectDay }: Props) {
  if (!open) return null;

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayKey = dateKey(today);
  const currentKey = dateKey(currentDate);

  // End on the Sunday on/after today so today is always visible
  const todayDow = today.getDay();
  const daysToSunday = todayDow === 0 ? 0 : 7 - todayDow;
  const end = new Date(today);
  end.setDate(today.getDate() + daysToSunday);
  const start = new Date(end);
  start.setDate(end.getDate() - 69);
  const totalDays = Math.round((end.getTime() - start.getTime()) / 86_400_000) + 1;

  const days: { key: string; date: Date; isFuture: boolean }[] = [];
  const cursor = new Date(start);
  for (let i = 0; i < totalDays; i++) {
    days.push({ key: dateKey(cursor), date: new Date(cursor), isFuture: cursor > today });
    cursor.setDate(cursor.getDate() + 1);
  }

  return (
    <div className="history-panel">
      <div className="eyebrow">Last 10 weeks</div>
      <div className="history-grid">
        {DOW_LABELS.map((d, i) => (
          <div className="history-dow" key={i}>
            {d}
          </div>
        ))}
        {days.map(({ key, date, isFuture }) => {
          const hasEntries = (data.logs[key]?.length ?? 0) > 0;
          const isToday = key === todayKey;
          const isCurrent = key === currentKey;
          let cls = 'history-day';
          if (isCurrent) cls += ' is-current';
          else if (hasEntries) cls += ' has-entries';
          else if (isToday) cls += ' is-today';
          if (isFuture) cls += ' empty-slot';

          return (
            <button
              key={key}
              className={cls}
              disabled={isFuture}
              onClick={() => onSelectDay(date)}
              aria-label={date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
            >
              {date.getDate()}
            </button>
          );
        })}
      </div>
    </div>
  );
}
