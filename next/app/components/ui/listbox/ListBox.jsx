import React, { useState, useRef } from 'react';
import { PlusIcon, DashIcon } from '@primer/octicons-react';
import ListBoxArea from "./ListBoxArea";
import ListBoxPopover from "./ListBoxPopover";
import Button from '@/app/components/ui/Button';
import { inputStyles, listboxStyles, textStyles } from '@/app/styles/tailwindStyles';

export default function ListBox({ options, selected, onChange }) {
    const [items, setItems] = useState(selected || []);
    const [showPopover, setShowPopover] = useState(false);
    const toggleButtonRef = useRef(null);

    const handleAddItem = (item) => {
        if (!item) return;
        if (!items.find(i => i.id === item.id)) {
            const newItems = [...items, item];
            setItems(newItems);
            onChange && onChange(newItems);
        }
        setShowPopover(false);
    };

    const handleRemoveItem = (itemId) => {
        const newItems = items.filter(item => item.id !== itemId);
        setItems(newItems);
        onChange && onChange(newItems);
    };

    return (
        <div className={`flex flex-col space-y-2 ${listboxStyles.default}`}>
            <ListBoxArea items={items} onRemove={handleRemoveItem} />
            <div className="relative">
                <Button
                    ref={toggleButtonRef}
                    type="button"
                    variant="outline_full"
                    onClick={(e) => {
                        e.stopPropagation();
                        setShowPopover(!showPopover);
                    }}>
                    {showPopover ? (
                        <DashIcon size={16} className={textStyles.default} />
                    ) : (
                        <PlusIcon size={16} className={textStyles.default} />
                    )}
                </Button>
                <ListBoxPopover
                    isOpen={showPopover}
                    options={options}
                    onSelect={handleAddItem}
                    onClose={() => setShowPopover(false)}
                    toggleButtonRef={toggleButtonRef}
                />
            </div>
        </div>
    );
}