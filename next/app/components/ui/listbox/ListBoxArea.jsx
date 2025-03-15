import React from 'react';
import ListBoxItem from "./ListBoxItem";
import Card from '@/app/components/ui/Card';

export default function ListBoxArea({ items, onRemove }) {
    return (
        <div className="flex flex-col bg-white border border-gray-200 rounded-[12.5px] max-h-[160px] overflow-y-auto">
            {items.length === 0 ? (
                <Card variant="empty_list">
                    <p className="text-center text-gray-600">Aucun élément sélectionné.</p>
                </Card>
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
