import React from 'react';
import TableCell from './TableCell';

const TableRow = ({ rowData, columns }) => {
  return (
    <tr>
      {columns.map((col) => (
        <TableCell key={col.key} value={rowData[col.key]} />
      ))}
    </tr>
  );
};

export default TableRow;