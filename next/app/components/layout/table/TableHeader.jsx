'use client';

import React from 'react';

import SortButton from '@/app/components/ui/SortButton';

export default function TableHeader({ columns, onSort, sortColumn, sortOrder }) {
  const textColumnsCount = columns.filter(col => col.key !== 'actions').length;
  const thBaseClasses = "py-4 px-6 text-left align-middle select-none";
  const baseTransitionClasses = "transition-colors duration-300 whitespace-nowrap";
  const clickableContainerClasses = "group cursor-pointer hover:scale-105 active:scale-105 transition-transform duration-200 inline-flex items-center gap-1";
  const sortButtonWrapperClasses = "ml-1 flex items-center transition-colors duration-300";

  return (
    <thead className="sticky top-0 bg-white shadow">
      <tr className="border-b border-gray-300">
        {columns.map(col => {
          const isSelected = sortColumn === col.key;
          const titleClasses = isSelected
            ? `font-bold underline underline-offset-4 text-[var(--accent-color)] ${baseTransitionClasses}`
            : `${baseTransitionClasses} group-hover:text-[var(--accent-color)]`;

          return (
            <th
              key={col.key}
              className={thBaseClasses}
              style={{
                width: `${100 / textColumnsCount}%`,
                minWidth: "150px",
              }}
            >
              <div onClick={() => onSort(col.key)} className={clickableContainerClasses}>
                <span className={`relative inline-block ${titleClasses}`}>
                  {col.title}
                </span>
                {col.sortable && (
                  <span
                    className={`${sortButtonWrapperClasses} ${
                      isSelected
                        ? "text-[var(--accent-color)]"
                        : "group-hover:text-[var(--accent-color)]"
                    }`}
                  >
                    <SortButton isActive={isSelected} direction={sortOrder} />
                  </span>
                )}
              </div>
            </th>
          );
        })}
      </tr>
    </thead>
  );
};
