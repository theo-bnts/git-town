import React from 'react';
import SortButton from './SortButton';

const TableHeader = ({ columns, onSort, sortColumn, sortOrder }) => {
  return (
    <thead className="bg-gray-100">
      <tr>
        {columns.map((col) => (
          <th
            key={col.key}
            onClick={() => onSort(col.key)}
            className="text-left cursor-pointer py-2 px-4 border-b-2 border-gray-300 select-none"
          >
            {col.title}
            {col.sortable && (
              <SortButton isActive={sortColumn === col.key} direction={sortOrder} />
            )}
          </th>
        ))}
      </tr>
    </thead>
  );
};

export default TableHeader;