'use client';

import React from 'react';
import { listboxStyles } from '@/app/styles/tailwindStyles';
import ComboBox from '@/app/components/ui/combobox/ComboBox';

import ListBoxProvider from '@/app/components/ui/listbox/ListBoxProvider';
import ListBoxArea from '@/app/components/ui/listbox/ListBoxArea';
import useListBox from '@/app/components/ui/listbox/useListBox';

function StudentAdder({ options, placeholder }) {
  const { addItem } = useListBox();
  return (
    <ComboBox
      placeholder={placeholder}
      options={options}
      onSelect={addItem}
      maxVisible={4}
    />
  );
}

export default function StudentListBox({
  items,
  onChange,
  studentOptions = [],
  placeholder = 'Ajouter étudiant',
}) {
  return (
    <div className={`flex flex-col space-y-2 ${listboxStyles.default}`}>
      <ListBoxProvider items={items} onChange={onChange}>
        <ListBoxArea />
        <StudentAdder options={studentOptions} placeholder={placeholder} />
      </ListBoxProvider>
    </div>
  );
}
