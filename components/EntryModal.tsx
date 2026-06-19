'use client';

import { useEffect, useState } from 'react';
import { LogEntry, Meal } from '@/types';
import { nowTime } from '@/lib/date';
import { MealSelector } from './MealSelector';

interface Props {
  open: boolean;
  entry: LogEntry | null;
  onClose: () => void;
  onSave: (entry: LogEntry) => void;
  onDelete: () => void;
}

export function EntryModal({ open, entry, onClose, onSave, onDelete }: Props) {
  const [time, setTime] = useState('');
  const [food, setFood] = useState('');
  const [qty, setQty] = useState('');
  const [meal, setMeal] = useState<Meal | null>(null);
  const [notes, setNotes] = useState('');

  useEffect(() => {
    if (open && entry) {
      setTime(entry.time || '');
      setFood(entry.food || '');
      setQty(entry.qty || '');
      setMeal(entry.meal);
      setNotes(entry.notes || '');
    }
  }, [open, entry]);

  if (!open || !entry) return null;

  const handleSave = () => {
    const trimmedFood = food.trim();
    if (!trimmedFood) return;
    onSave({
      time: time || nowTime(),
      food: trimmedFood,
      qty: qty.trim() || '—',
      meal,
      notes: notes.trim() || null,
    });
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleSave();
  };

  return (
    <div
      className="modal-overlay open"
      role="dialog"
      aria-modal="true"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="modal">
        <div className="modal-header">
          <div className="modal-header-icon">
            <i className="ti ti-pencil" aria-hidden="true" />
          </div>
          <h3>Edit entry</h3>
        </div>

        <div className="form-grid" style={{ marginBottom: 10 }}>
          <div className="field">
            <label>Time</label>
            <input type="time" value={time} onChange={(e) => setTime(e.target.value)} />
          </div>
          <div className="field">
            <label>Food</label>
            <input
              type="text"
              value={food}
              onChange={(e) => setFood(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="e.g. porridge"
              autoFocus
            />
          </div>
          <div className="field">
            <label>Quantity</label>
            <input
              type="text"
              value={qty}
              onChange={(e) => setQty(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="e.g. 1 bowl"
            />
          </div>
        </div>

        <div className="field" style={{ marginBottom: 10 }}>
          <label>Meal</label>
          <MealSelector selected={meal} onChange={setMeal} />
        </div>

        <div className="field" style={{ marginBottom: 0 }}>
          <label>Notes</label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="e.g. post-run, felt good"
          />
        </div>

        <div className="modal-actions">
          <button className="btn-secondary" onClick={onClose}>
            Cancel
          </button>
          <button className="btn-primary" style={{ justifyContent: 'center' }} onClick={handleSave}>
            Save
          </button>
        </div>

        <button className="modal-delete" style={{ display: 'block' }} onClick={onDelete}>
          <i className="ti ti-trash" aria-hidden="true" style={{ fontSize: 13, marginRight: 4 }} />
          Delete this entry
        </button>
      </div>
    </div>
  );
}
