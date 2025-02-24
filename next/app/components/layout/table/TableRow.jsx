import React from 'react';
import TableCell from './TableCell';

const TableRow = ({ rowData, columns }) => (
  <tr className="hover:bg-gray-50">
    {columns.map(({ key }) => (
      <TableCell key={key} value={rowData[key]} columnKey={key} />
    ))}
  </tr>
);

export default TableRow;
