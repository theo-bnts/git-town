import React from 'react';
import SortButton from '../../ui/SortButton';

const TableHeader = ({ columns, onSort, sortColumn, sortOrder }) => {
  // On considère que la colonne avec des boutons est identifiée par "actions"
  const textColumnsCount = columns.filter(col => col.key !== 'actions').length;

  return (
    <thead className="sticky top-0 bg-white shadow">
      <tr className="border-b border-gray-300">
        {columns.map((col) => {
          const isSelected = sortColumn === col.key;
          const baseClasses = "transition-colors duration-300 whitespace-nowrap";
          const titleClasses = isSelected
            ? `font-bold underline underline-offset-4 text-[var(--accent-color)] ${baseClasses}`
            : `${baseClasses} group-hover:text-[var(--accent-color)]`;

          return (
            <th
              key={col.key}
              className="py-4 px-6 text-left align-middle select-none"
              style={{
                width: `${100 / textColumnsCount}%`, // Égalise les largeurs de colonnes
                minWidth: "150px", // Empêche des tailles trop petites
              }}
            >
              <div
                onClick={() => onSort(col.key)}
                className="group cursor-pointer hover:scale-105 active:scale-105 transition-transform duration-200 inline-flex items-center gap-1"
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