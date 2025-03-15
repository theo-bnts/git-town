'use client';

import React from 'react';

import ComboBoxOption from '@/app/components/ui/combobox/ComboBoxOption';

export default function ComboBoxList({ 
  options, 
  onSelect, 
  searchTerm, 
  highlightedIndex, 
  selectedOption, 
  loadMore,
  maxVisible = 6
}) {
  const optionHeight = 40; // Hauteur approximative par option en pixels
  const maxHeight = maxVisible * optionHeight;

  return (
    <div 
      style={{ maxHeight: `${maxHeight}px` }}
      className="overflow-auto scroll-smooth shadow-inner transition-all duration-200 hover:shadow-md"
      onScroll={loadMore}
    >
      {options.length > 0 ? (
        options.map((option, index) => (
          <ComboBoxOption
            key={option.id}
            option={option}
            onSelect={onSelect}
            searchTerm={searchTerm}
            isHighlighted={index === highlightedIndex}
            isSelected={option.id === selectedOption?.id}
          />
        ))
      ) : (
        <div className="p-2 text-gray-500">Aucun résultat.</div>
      )}
    </div>
  );
}