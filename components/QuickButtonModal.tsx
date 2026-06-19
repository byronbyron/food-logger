'use client';

import { useEffect, useState } from 'react';
import { QuickButton } from '@/types';

interface Props {
  open: boolean;
  editing: QuickButton | null; // null = creating new
  onClose: () => void;
  onSave: (button: QuickButton) => void;
  onDelete: () => void;
}

export function QuickButtonModal({ open, editing, onClose, onSave, onDelete }: Props) {
  const [label, setLabel] = useState('');
  const [food, setFood] = useState('');
  const [qty, setQty] = useState('');

  useEffect(() => {
    if (open) {
      setLabel(editing?.label ?? '');
      setFood(editing?.food ?? '');
      setQty(editing?.qty ?? '');
    }
  }, [open, editing]);

  if (!open) return null;

  const handleSave = () => {
    if (!label.trim() || !food.trim()) return;
    onSave({ label: label.trim(), food: food.trim(), qty: qty.trim() });
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
            <i className="ti ti-bookmark" aria-hidden="true" />
          </div>
          <h3>{editing ? 'Edit quick-add button' : 'New quick-add button'}</h3>
        </div>

        <div className="field">
          <label>Button label</label>
          <input
            type="text"
            value={label}
            onChange={(e) => setLabel(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="e.g. Morning coffee"
            autoFocus
          />
        </div>
        <div className="field">
          <label>Food</label>
          <input
            type="text"
            value={food}
            onChange={(e) => setFood(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="e.g. Coffee"
          />
        </div>
        <div className="field">
          <label>Quantity</label>
          <input
            type="text"
            value={qty}
            onChange={(e) => setQty(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="e.g. 1 mug"
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

        {editing && (
          <button className="modal-delete" style={{ display: 'block' }} onClick={onDelete}>
            <i className="ti ti-trash" aria-hidden="true" style={{ fontSize: 13, marginRight: 4 }} />
            Delete this button
          </button>
        )}
      </div>
    </div>
  );
}
