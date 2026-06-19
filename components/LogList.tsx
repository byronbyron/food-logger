'use client';

import { LogEntry, MEALS, MEAL_LABELS, Meal } from '@/types';

interface Props {
  entries: LogEntry[];
  onEdit: (index: number) => void;
  onDuplicate: (index: number) => void;
  onDelete: (index: number) => void;
}

const GROUP_ORDER: (Meal | 'other')[] = ['breakfast', 'lunch', 'dinner', 'snack', 'drinks', 'other'];

export function LogList({ entries, onEdit, onDuplicate, onDelete }: Props) {
  if (entries.length === 0) {
    return (
      <div className="log-empty">
        <i className="ti ti-bowl" aria-hidden="true" />
        Nothing logged yet — add an entry above
      </div>
    );
  }

  const useGroups = entries.some((e) => e.meal);
  const groups: Record<string, { entry: LogEntry; index: number }[]> = {};

  entries.forEach((entry, index) => {
    const key = entry.meal && MEALS.includes(entry.meal) ? entry.meal : 'other';
    if (!groups[key]) groups[key] = [];
    groups[key].push({ entry, index });
  });

  const renderEntry = ({ entry, index }: { entry: LogEntry; index: number }) => (
    <div className="log-entry" key={index}>
      <span className="entry-time">{entry.time || '--:--'}</span>
      <span className="entry-dot" />
      <div className="entry-body">
        <div className="entry-food">{entry.food}</div>
        {entry.notes && <div className="entry-notes">{entry.notes}</div>}
      </div>
      {entry.meal && MEALS.includes(entry.meal) && (
        <span className={`meal-tag tag-${entry.meal}`}>{MEAL_LABELS[entry.meal]}</span>
      )}
      <span className="entry-qty">{entry.qty}</span>
      <div className="entry-actions">
        <button className="entry-action-btn edit" onClick={() => onEdit(index)} aria-label={`Edit ${entry.food}`}>
          <i className="ti ti-pencil" style={{ fontSize: 13 }} aria-hidden="true" />
        </button>
        <button className="entry-action-btn dup" onClick={() => onDuplicate(index)} aria-label={`Duplicate ${entry.food}`}>
          <i className="ti ti-copy" style={{ fontSize: 13 }} aria-hidden="true" />
        </button>
        <button className="entry-action-btn del" onClick={() => onDelete(index)} aria-label={`Remove ${entry.food}`}>
          <i className="ti ti-x" style={{ fontSize: 13 }} aria-hidden="true" />
        </button>
      </div>
    </div>
  );

  if (!useGroups) {
    return <div className="log-list">{entries.map((entry, index) => renderEntry({ entry, index }))}</div>;
  }

  return (
    <>
      {GROUP_ORDER.filter((key) => groups[key]?.length).map((key) => (
        <div className="meal-group" key={key}>
          <div className={`meal-group-label lbl-${key}`}>{key === 'other' ? 'Other' : MEAL_LABELS[key as Meal]}</div>
          <div className="log-list">{groups[key].map(renderEntry)}</div>
        </div>
      ))}
    </>
  );
}
