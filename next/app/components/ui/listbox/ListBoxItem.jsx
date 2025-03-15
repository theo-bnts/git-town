import React from 'react';

export default function ListBoxItem({ option, onRemove }) {
    return (
        <div className="flex items-center justify-between px-4 py-2 bg-white border cursor-pointer">
            <span>{option.value}</span>
            <button 
                onClick={onRemove}
                className="text-red-500 hover:underline">
                Retirer
            </button>
        </div>
    );
}