'use client';

import React, { useRef, useEffect } from 'react';

import { highlightMatch } from '@/app/utils/stringUtils';

import { IssueClosedIcon, IssueOpenedIcon } from '@primer/octicons-react';

export default function ComboBoxOption({ 
  option, 
  onSelect, 
  searchTerm, 
  isHighlighted, 
  isSelected 
}) {
  const optionRef = useRef(null);

  useEffect(() => {
    if (isHighlighted && optionRef.current) {
      optionRef.current.scrollIntoView({
        behavior: 'smooth',
        block: 'nearest',
      });
    }
  }, [isHighlighted]);

  return (
    <div
      ref={optionRef}
      className={`
        p-2 hover:bg-gray-100 cursor-pointer 
        flex justify-between items-center
        group
        ${isHighlighted ? 'bg-gray-100' : ''}
      `}
      onClick={() => onSelect(option)}
    >
      <span>{highlightMatch(option.value, searchTerm)}</span>

      {isSelected ? (
        <IssueClosedIcon className="text-[var(--selected-color)]" />
      ) : (
        <IssueOpenedIcon
          className="
            text-gray-500
            opacity-0 
            group-hover:opacity-100
          "
        />
      )}
    </div>
  );
}
