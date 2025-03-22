'use client';

import React, { useRef, useEffect } from 'react';

import { IssueClosedIcon, IssueOpenedIcon } from '@primer/octicons-react';

import { highlightMatch } from '@/app/utils/stringUtils';

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
        p-2 cursor-pointer flex justify-between items-center group relative
        transition-all duration-200 ease-in-out
        ${isHighlighted 
          ? 'bg-gray-300 opacity-100' 
          : 'hover:bg-gray-200 hover:opacity-100'
        }
      `}
      onClick={() => onSelect(option)}
    >
      <span
        className={`
          transition-all duration-200 ease-in-out
          ${isSelected 
            ? 'text-[var(--selected-color)]' 
            : ''
          }
          ${isHighlighted 
            ? 'opacity-100 translate-x-1' 
            : 'opacity-80 group-hover:opacity-100 group-hover:translate-x-1'
          }
        `}
      >
        {highlightMatch(option.value, searchTerm)}
      </span>

      {isSelected ? (
        <IssueClosedIcon className="
          text-[var(--selected-color)] 
          transition-opacity duration-200 ease-in-out" 
        />
      ) : (
        <IssueOpenedIcon
          className={`
            text-gray-500 transition-opacity duration-200 ease-in-out
            ${isHighlighted 
              ? 'opacity-100' 
              : 'opacity-0 group-hover:opacity-100'
            }
          `}
        />
      )}
    </div>
  );
}
