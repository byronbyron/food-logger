'use client';

import { QuickButton } from '@/types';

interface Props {
  buttons: QuickButton[];
  onUse: (button: QuickButton) => void;
  onEdit: (index: number) => void;
  onNew: () => void;
}

export function QuickAddButtons({ buttons, onUse, onEdit, onNew }: Props) {
  return (
    <div className="quick-section">
      <div className="eyebrow">Quick add</div>
      <div className="quick-buttons">
        {buttons.map((b, i) => (
          <button key={i} className="quick-btn" onClick={() => onUse(b)}>
            <span className="qb-icon">
              <i className="ti ti-bolt" aria-hidden="true" />
            </span>
            {b.label}
            <span
              className="qb-edit"
              onClick={(e) => {
                e.stopPropagation();
                onEdit(i);
              }}
            >
              <i className="ti ti-pencil" aria-hidden="true" />
            </span>
          </button>
        ))}
        <button className="add-quick-btn" onClick={onNew}>
          <i className="ti ti-plus" aria-hidden="true" />
          New button
        </button>
      </div>
    </div>
  );
}
