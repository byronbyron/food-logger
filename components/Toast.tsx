'use client';

import { forwardRef, useImperativeHandle, useRef, useState } from 'react';

export interface ToastHandle {
  show: (message: string) => void;
}

export const Toast = forwardRef<ToastHandle>((_props, ref) => {
  const [message, setMessage] = useState('');
  const [visible, setVisible] = useState(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useImperativeHandle(ref, () => ({
    show(msg: string) {
      setMessage(msg);
      setVisible(true);
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      timeoutRef.current = setTimeout(() => setVisible(false), 2200);
    },
  }));

  return (
    <div className={`toast ${visible ? 'show' : ''}`} role="status" aria-live="polite">
      <i className="ti ti-check" aria-hidden="true" />
      <span>{message}</span>
    </div>
  );
});

Toast.displayName = 'Toast';
