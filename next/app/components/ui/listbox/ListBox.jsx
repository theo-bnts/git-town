'use client';

import React, { useState } from 'react';

import { listboxStyles } from '@/app/styles/tailwindStyles';

import ComboBox from '@/app/components/ui/combobox/ComboBox';
import ListBoxArea from '@/app/components/ui/listbox/ListBoxArea';

export default function ListBox({ placeholder, options, selected, onChange }) {
    const [items, setItems] = useState(selected || []);

    const handleAddItem = (item) => {
        if (!item) return;
        const exists = items.some(i => i.id === item.id || i.value === item.value);
        if (exists) return;
        const newItems = [...items, item];
        setItems(newItems);
        onChange && onChange(newItems);
    };

    const handleRemoveItem = (itemId) => {
        const newItems = items.filter(item => item.id !== itemId);
        setItems(newItems);
        onChange && onChange(newItems);
    };

    return (
        <div className={`flex flex-col space-y-2 ${listboxStyles.default}`}>
            <ListBoxArea items={items} onRemove={handleRemoveItem} />
            <ComboBox
                key={items.map(item => item.id).join('-')}
                placeholder={placeholder}
                options={options}
                onSelect={handleAddItem}
                maxVisible={4}
                autoOpen={false}
            />
        </div>
    );
}
