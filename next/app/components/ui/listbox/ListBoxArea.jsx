import React from 'react';
import ListBoxItem from "./ListBoxItem";
import EmptyListCard from '@/app/components/ui/listbox/EmptyListCard';

export default function ListBoxArea({ items, onRemove }) {
    return (
        <div className="flex flex-col">
            {items.length === 0 ? (
                <EmptyListCard message="Aucun élément sélectionné" />
            ) : (
                items.map(item => (
                    <ListBoxItem 
                        key={item.id} 
                        option={item} 
                        onRemove={() => onRemove(item.id)} />
                ))
            )}
        </div>
    );
}