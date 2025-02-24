'use client';

import React from 'react';

import TableCell from '@/app/components/layout/table/TableCell';

export default function TableRow({ rowData, columns }) {
  return (
    <tr className="hover:bg-gray-50">
      {columns.map(({ key }) => (
        <TableCell key={key} value={rowData[key]} columnKey={key} />
      ))}
    </tr>
  );
};
