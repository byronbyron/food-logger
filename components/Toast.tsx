'use client';

import { forwardRef, useImperativeHandle, useRef, useState } from 'react';

export interface ToastHandle {
  show: (message: string) => void;
  showWithAction: (message: string, actionLabel: string, onAction: () => void) => void;
}

export const Toast = forwardRef<ToastHandle>((_props, ref) => {
  const [message, setMessage] = useState('');
  const [visible, setVisible] = useState(false);
  const [action, setAction] = useState<{ label: string; onClick: () => void } | null>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const dismiss = () => setVisible(false);

  useImperativeHandle(ref, () => ({
    show(msg: string) {
      setMessage(msg);
      setAction(null);
      setVisible(true);
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      timeoutRef.current = setTimeout(dismiss, 2200);
    },
    showWithAction(msg: string, actionLabel: string, onAction: () => void) {
      setMessage(msg);
      setAction({
        label: actionLabel,
        onClick: () => {
          onAction();
          dismiss();
        },
      });
      setVisible(true);
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      timeoutRef.current = setTimeout(dismiss, 5000); // longer window for undo
    },
  }));

  return (
    <div className={`toast ${visible ? 'show' : ''}`} role="status" aria-live="polite">
      <i className="ti ti-check" aria-hidden="true" />
      <span>{message}</span>
      {action && (
        <button className="toast-action" onClick={action.onClick}>
          {action.label}
        </button>
      )}
    </div>
  );
});

Toast.displayName = 'Toast';

