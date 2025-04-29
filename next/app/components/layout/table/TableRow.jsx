'use client';

import React from 'react';
import TableCell from '@/app/components/layout/table/TableCell';

export default function TableRow({ rowData, columns }) {
  if (rowData.skeleton) {
    return (
      <tr>
        {columns.map((col) => (
          <td
            key={col.key}
            className="py-4 px-6 border-b border-gray-200"
          >
            <div className="h-6 bg-gray-300 rounded animate-pulse w-full" />
          </td>
        ))}
      </tr>
    );
  }

  return (
    <tr className="hover:bg-gray-50">
      {columns.map(({ key }) => (
        <TableCell key={key} value={rowData[key]} columnKey={key} />
      ))}
    </tr>
  );
}
