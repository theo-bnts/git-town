import React, { useState } from 'react';
import ListBoxArea from "./ListBoxArea";
import ComboBox from '@/app/components/ui/combobox/ComboBox';
import { listboxStyles } from '@/app/styles/tailwindStyles';

export default function ListBox({ placeholder, options, selected, onChange }) {
    const [items, setItems] = useState(selected || []);

    const handleAddItem = (item) => {
        if (!item) return;
        if (!items.find(i => i.id === item.id)) {
            const newItems = [...items, item];
            setItems(newItems);
            onChange && onChange(newItems);
        }
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
                placeholder={placeholder}
                options={options}
                onSelect={handleAddItem}
                maxVisible={4}
                autoOpen={false}
            />
        </div>
    );
}