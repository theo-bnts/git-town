'use client';

import React from 'react';
import ListBoxProvider from './ListBoxProvider';
import ListBoxArea from './ListBoxArea';
import { listboxStyles } from '@/app/styles/tailwindStyles';

/**
 * Generic ListBox: just give it an AddComponent when you need a custom picker.
 */
export default function FlexibleListBox({ items, onChange, AddComponent, renderChip }) {
  return (
    <div className={`flex flex-col space-y-2 ${listboxStyles.default}`}>
      <ListBoxProvider items={items} onChange={onChange}>
        <ListBoxArea renderChip={renderChip} />
        {AddComponent && <AddComponent />}
      </ListBoxProvider>
    </div>
  );
}
