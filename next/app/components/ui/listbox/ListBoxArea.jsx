'use client';

import React from 'react';
import Card from '@/app/components/ui/Card';
import useListBox from './useListBox';
import ListBoxItem from './ListBoxItem';
import { listboxStyles } from '@/app/styles/tailwindStyles';

/**
 * Display the list of currently selected items (with empty state).
 */
export default function ListBoxArea({ renderChip, onEdit }) {
  const { items, removeItem } = useListBox();
  const sorted = [...items].sort((a, b) => (a.value || '').localeCompare(b.value || ''));

  return (
    <div className={`flex flex-col bg-white border border-gray-200 rounded-[12.5px] overflow-hidden ${listboxStyles?.default ?? ''}`}>
      <div className="max-h-[160px] overflow-y-auto">
        {sorted.length === 0 ? (
          <Card variant="empty_list">
            <p className="text-center text-gray-600">Aucun élément sélectionné.</p>
          </Card>
        ) : (
          sorted.map((item, idx) => (
            <ListBoxItem
              key={item.id ?? idx}
              item={item}
              renderChip={renderChip}
              onEdit={onEdit ? () => onEdit(item) : undefined}
              onRemove={() => removeItem(item.id ?? idx)}
            />
          ))
        )}
      </div>
    </div>
  );
}
