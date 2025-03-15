'use client';

import React from 'react';

import ComboBoxList from '@/app/components/ui/combobox/ComboBoxList';

export default function ComboBoxPopover({ 
  isOpen,
  options, 
  onSelect, 
  searchTerm, 
  highlightedIndex, 
  selectedOption, 
  loadMore,
  maxVisible
}) {
  return (
    <div
      className={`
        absolute w-full mt-2 bg-white border border-gray-300 
        rounded-lg shadow-lg z-10 overflow-hidden
        transition-all duration-200 transform origin-top
        ${isOpen ? 'opacity-100 scale-100' : 'opacity-0 scale-95 pointer-events-none'}
      `}
    >
      <ComboBoxList
        options={options}
        onSelect={onSelect}
        searchTerm={searchTerm}
        highlightedIndex={highlightedIndex}
        selectedOption={selectedOption}
        loadMore={loadMore}
        maxVisible={maxVisible}
      />
    </div>
  );
}
