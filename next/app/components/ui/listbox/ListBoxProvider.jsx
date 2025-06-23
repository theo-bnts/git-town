'use client';

import React, { useCallback, useMemo } from 'react';
import ListBoxContext from '@/app/components/ui/listbox/context';

function sortByDateDesc(a, b) {
  return new Date(b.Date) - new Date(a.Date);
}

export default function ListBoxProvider({ items = [], onChange, children }) {
  const sortedItems = useMemo(() => {
    return [...items].sort(sortByDateDesc);
  }, [items]);

  const addItem = useCallback(
    (item) => {
      if (!item || items.some((i) => i.id === item.id)) return;
      onChange([...sortedItems, item].sort(sortByDateDesc));
    },
    [items, sortedItems, onChange]
  );

  const updateItem = useCallback(
    (id, updates) => {
      const updated = sortedItems.map((i) =>
        i.id === id ? { ...i, ...updates } : i
      );
      onChange(updated.sort(sortByDateDesc));
    },
    [sortedItems, onChange]
  );

  const removeItem = useCallback(
    (id) => {
      onChange(sortedItems.filter((i) => i.id !== id));
    },
    [sortedItems, onChange]
  );

  const value = useMemo(
    () => ({ items: sortedItems, addItem, updateItem, removeItem }),
    [sortedItems, addItem, updateItem, removeItem]
  );

  return (
    <ListBoxContext.Provider value={value}>
      {children}
    </ListBoxContext.Provider>
  );
}
