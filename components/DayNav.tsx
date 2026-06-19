'use client';

import { formatDayLabel } from '@/lib/date';

interface Props {
  currentDate: Date;
  onChange: (date: Date) => void;
}

export function DayNav({ currentDate, onChange }: Props) {
  const goTo = (offset: number) => {
    const next = new Date(currentDate);
    next.setDate(next.getDate() + offset);
    onChange(next);
  };

  const goToday = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    onChange(today);
  };

  return (
    <div className="day-nav">
      <button className="day-nav-arrow" onClick={() => goTo(-1)} aria-label="Previous day">
        <i className="ti ti-chevron-left" aria-hidden="true" />
      </button>
      <span className="day-label">{formatDayLabel(currentDate)}</span>
      <button className="day-nav-arrow" onClick={() => goTo(1)} aria-label="Next day">
        <i className="ti ti-chevron-right" aria-hidden="true" />
      </button>
      <button className="today-btn" onClick={goToday}>
        Today
      </button>
    </div>
  );
}
