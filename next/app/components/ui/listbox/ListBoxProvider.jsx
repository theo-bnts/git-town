'use client';

import React, { useCallback, useMemo } from 'react';
import ListBoxContext from '@/app/components/ui/listbox/context';

export default function ListBoxProvider({ items = [], onChange, children }) {
  const addItem = useCallback(
    (item) => {
      if (!item || items.some((i) => i.id === item.id)) return;
      onChange([...items, item]);
    },
    [items, onChange]
  );

  const updateItem = useCallback(
    (id, updates) => onChange(items.map((i) => (i.id === id ? { ...i, ...updates } : i))),
    [items, onChange]
  );

  const removeItem = useCallback(
    (id) => onChange(items.filter((i) => i.id !== id)),
    [items, onChange]
  );

  const value = useMemo(() => ({ items, addItem, updateItem, removeItem }), [items, addItem, updateItem, removeItem]);

  return <ListBoxContext.Provider value={value}>{children}</ListBoxContext.Provider>;
}
