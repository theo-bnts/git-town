import React from 'react';
import SortButton from '../../ui/SortButton';

const TableHeader = ({ columns, onSort, sortColumn, sortOrder }) => {
  // On considère que la colonne avec des boutons est identifiée par "actions"
  const textColumnsCount = columns.filter(col => col.key !== 'actions').length;
  
  return (
    <thead>
      <tr className="border-b border-gray-300">
        {columns.map((col) => {
          const isSelected = sortColumn === col.key;
          const baseClasses = "transition-colors duration-300";
          const titleClasses = isSelected
            ? `font-bold underline underline-offset-4 text-[var(--accent-color)] ${baseClasses}`
            : `${baseClasses} group-hover:text-[var(--accent-color)]`;

          // Si la colonne n'est pas "actions", on lui attribue une largeur égale.
          const colStyle = col.key !== 'actions'
            ? { width: `${100 / textColumnsCount}%` }
            : {};
          
          return (
            <th
              key={col.key}
              style={colStyle}
              className="py-4 px-6 text-left align-middle select-none"
            >
              <div
                onClick={() => onSort(col.key)}
                className="group cursor-pointer active:scale-105 transition-transform duration-200 inline-flex items-center"
              >
                <span className={`relative inline-block ${titleClasses}`}>
                  {col.title}
                </span>
                {col.sortable && (
                  <span
                    className={`ml-1 flex items-center transition-colors duration-300 ${
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

export default TableHeader;