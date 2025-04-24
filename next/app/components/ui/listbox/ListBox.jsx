'use client';

import React from 'react';
import { listboxStyles } from '@/app/styles/tailwindStyles';
import ListBoxArea from '@/app/components/ui/listbox/ListBoxArea';

export default function ListBox({ items, onChange, renderAdd, renderChip, onEdit }) {
  const addItem = (item) => {
    if (!item || items.some((i) => i.id === item.id)) return;
    onChange([...items, item]);
  };

  const updateItem = (id, updates) => {
    onChange(items.map((i) => (i.id === id ? { ...i, ...updates } : i)));
  };

  const removeItem = (id) => {
    onChange(items.filter((i) => i.id !== id));
  };

  return (
    <div className={`flex flex-col space-y-2 ${listboxStyles.default}`}>
      <ListBoxArea
        items={items}
        onRemove={removeItem}
        onEdit={onEdit}
        renderChip={renderChip}
      />
      {renderAdd ? renderAdd({ addItem, updateItem }) : null}
    </div>
  );
}
