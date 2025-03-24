'use client';

import React from 'react';
import Card from '@/app/components/ui/Card';
import ListBoxItem from '@/app/components/ui/listbox/ListBoxItem';

export default function ListBoxArea({ items, onRemove }) {
  const sortedItems = [...items].sort((a, b) => (a.value || '').localeCompare(b.value || ''));

  return (
    <div className="flex flex-col bg-white border border-gray-200 rounded-[12.5px] overflow-hidden">
      <div className="max-h-[160px] overflow-y-auto">
        {sortedItems.length === 0 ? (
          <Card variant="empty_list">
            <p className="text-center text-gray-600">
              Aucun élément sélectionné.
            </p>
          </Card>
        ) : (
          sortedItems.map((item, index) => (
            <ListBoxItem 
              key={item.id || index}
              option={item} 
              onRemove={() => onRemove(item.id || index)} 
            />
          ))
        )}
      </div>
    </div>
  );
}
