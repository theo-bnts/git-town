'use client';

import React from 'react';
import Card from '@/app/components/ui/Card';
import ListBoxItem from '@/app/components/ui/listbox/ListBoxItem';

export default function ListBoxArea({ items, onRemove, onEdit, renderChip }) {
  const Chip = renderChip || ListBoxItem;
  const sorted = [...items].sort((a, b) => (a.value || '').localeCompare(b.value || ''));

  return (
    <div className="flex flex-col bg-white border border-gray-200 rounded-[12.5px] overflow-hidden">
      <div className="max-h-[160px] overflow-y-auto">
        {sorted.length === 0 ? (
          <Card variant="empty_list">
            <p className="text-center text-gray-600">Aucun élément sélectionné.</p>
          </Card>
        ) : (
          sorted.map((it, i) => (
            <Chip
              key={it.id || i}
              option={it}
              onRemove={() => onRemove(it.id || i)}
              onEdit={() => onEdit?.(it)}
            />
          ))
        )}
      </div>
    </div>
  );
}
