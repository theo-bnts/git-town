'use client';

import React from 'react';
import ListBoxProvider from '@/app/components/ui/listbox/ListBoxProvider';
import ListBoxArea from '@/app/components/ui/listbox/ListBoxArea';
import { listboxStyles } from '@/app/styles/tailwindStyles';

export default function ListBox({ items, onChange, AddComponent, renderChip }) {
  return (
    <div className={`flex flex-col space-y-2 ${listboxStyles.default}`}>
      <ListBoxProvider items={items} onChange={onChange}>
        <ListBoxArea renderChip={renderChip} />
        {AddComponent && <AddComponent />}
      </ListBoxProvider>
    </div>
  );
}
