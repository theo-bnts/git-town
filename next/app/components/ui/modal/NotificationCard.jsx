'use client';

import { useState, useEffect, useRef } from 'react';
import ReactDOM from 'react-dom';
import Card from '@/app/components/ui/Card';
import Button from '@/app/components/ui/Button';
import { XIcon } from '@primer/octicons-react';

export function NotificationCard({ message, type = 'success', onClear }) {
  const [visible, setVisible] = useState(!!message);
  const [paused, setPaused] = useState(false);
  const [progress, setProgress] = useState(100);
  const intervalRef = useRef(null);

  useEffect(() => {
    if (!message) return;
    setVisible(true);
    setProgress(100);
    const total = 10000, tick = 100;
    let elapsed = 0;

    intervalRef.current = setInterval(() => {
      if (!paused) {
        elapsed += tick;
        const pct = Math.max(0, 100 - (elapsed / total) * 100);
        setProgress(pct);
        if (elapsed >= total) {
          clearInterval(intervalRef.current);
          setVisible(false);
          onClear?.();
        }
      }
    }, tick);

    return () => clearInterval(intervalRef.current);
  }, [message, paused, onClear]);

  if (!visible || !message) return null;

  const variant = type === 'success' ? 'success' : 'warn';

  const toast = (
    <div
      className="fixed bottom-4 right-4 z-50"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <Card variant={variant}>
        <div
          className="absolute top-0 left-0 h-1 bg-current"
          style={{ width: `${progress}%`, transition: 'width 0.1s linear' }}
        />
        <div className="flex items-center">
          <p >{message}</p>
          <Button
            variant="cancel_action_sq"
            className="ml-2"
            onClick={() => {
              clearInterval(intervalRef.current);
              setVisible(false);
              onClear?.();
            }}
          >
            <XIcon size={20} />
          </Button>
        </div>
      </Card>
    </div>
  );

  return ReactDOM.createPortal(toast, document.body);
}
