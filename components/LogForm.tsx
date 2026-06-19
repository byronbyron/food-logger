'use client';

import { useState, useEffect } from 'react';
import { LogEntry, Meal } from '@/types';
import { nowTime } from '@/lib/date';
import { MealSelector } from './MealSelector';

interface Props {
  onLog: (entry: LogEntry) => void;
  prefill: { food: string; qty: string } | null;
  onPrefillConsumed: () => void;
}

export function LogForm({ onLog, prefill, onPrefillConsumed }: Props) {
  const [time, setTime] = useState(nowTime());
  const [food, setFood] = useState('');
  const [qty, setQty] = useState('');
  const [meal, setMeal] = useState<Meal | null>(null);
  const [notes, setNotes] = useState('');

  useEffect(() => {
    if (prefill) {
      setFood(prefill.food);
      setQty(prefill.qty);
      if (!time) setTime(nowTime());
      onPrefillConsumed();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [prefill]);

  const reset = () => {
    setFood('');
    setQty('');
    setTime(nowTime());
    setNotes('');
    setMeal(null);
  };

  const handleLog = () => {
    const trimmedFood = food.trim();
    if (!trimmedFood) return;
    onLog({
      time: time || nowTime(),
      food: trimmedFood,
      qty: qty.trim() || '—',
      meal,
      notes: notes.trim() || null,
    });
    reset();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleLog();
  };

  return (
    <div className="form-card">
      <div className="eyebrow" style={{ marginBottom: 14 }}>
        Log food
      </div>
      <div className="form-grid">
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

      <div className="form-grid-2">
        <div className="field">
          <label>Meal</label>
          <MealSelector selected={meal} onChange={setMeal} />
        </div>
        <div className="field">
          <label>Notes</label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="e.g. post-run, felt good"
          />
        </div>
      </div>

      <div className="form-actions">
        <button className="btn-primary" onClick={handleLog}>
          <i className="ti ti-plus" aria-hidden="true" />
          Log entry
        </button>
        <button className="btn-secondary" onClick={reset}>
          Clear
        </button>
      </div>
    </div>
  );
}
