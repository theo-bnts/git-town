'use client';

import React from 'react';
import { listboxStyles } from '@/app/styles/tailwindStyles';
import ComboBox from '@/app/components/ui/combobox/ComboBox';

import ListBoxProvider from '@/app/components/ui/listbox/ListBoxProvider';
import ListBoxArea from '@/app/components/ui/listbox/ListBoxArea';
import useListBox from '@/app/components/ui/listbox/useListBox';

function PromotionAdder({ options, placeholder }) {
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

export default function PromotionListBox({ 
  items, 
  onChange, 
  promotionOptions = [], 
  placeholder = 'Ajouter promotion' }) {

  return (
    <div className={`flex flex-col space-y-2 ${listboxStyles.default}`}>
      <ListBoxProvider items={items} onChange={onChange}>
        <ListBoxArea />
        <PromotionAdder options={promotionOptions} placeholder={placeholder} />
      </ListBoxProvider>
    </div>
  );
}
