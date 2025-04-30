'use client';
import { useState, useCallback } from 'react';

export function useModal() {
  const [isOpen, setOpen] = useState(false);
  const [payload, setPayload] = useState(null);

  const open = useCallback((p) => {
    setPayload(p);
    setOpen(true);
  }, []);

  const close = useCallback(() => {
    setPayload(null);
    setOpen(false);
  }, []);

  return { isOpen, payload, open, close };
}