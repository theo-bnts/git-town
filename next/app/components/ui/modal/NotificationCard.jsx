'use client';

import { useState, useEffect, useRef } from 'react';
import ReactDOM from 'react-dom';
import Card from '@/app/components/ui/Card';
import Button from '@/app/components/ui/Button';
import { XIcon } from '@primer/octicons-react';

/**
 * Affiche un toast de notification (succès ou erreur) en bas à droite.
 */
export function NotificationCard({ message, type = 'success', onClear }) {
  const [visible, setVisible] = useState(!!message);
  const [paused, setPaused] = useState(false);
  const [progress, setProgress] = useState(100);
  const intervalRef = useRef(null);

  useEffect(() => {
    if (!message) return;
    setVisible(true);
    setProgress(100);
    const total = 5000, tick = 100;
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
      className="fixed bottom-4 right-4 z-50 w-80"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <Card variant={variant} className="relative overflow-hidden">
        <div
          className="absolute top-0 left-0 h-1 bg-current"
          style={{ width: `${progress}%`, transition: 'width 0.1s linear' }}
        />
        <div className="p-4 flex items-center">
          <p className="flex-1 break-words">{message}</p>
          <Button
            variant="cancel_action_sq"
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
