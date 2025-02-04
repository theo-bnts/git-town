import React from 'react';
import TableCell from './TableCell';

const TableRow = ({ rowData, columns }) => {
  return (
    // On peut éventuellement ajouter une classe sur <tr> si besoin (ex. : hover:bg-gray-50)
    <tr>
      {columns.map((col) => (
        <TableCell key={col.key} value={rowData[col.key]} columnKey={col.key} />
      ))}
    </tr>
  );
};

export default TableRow;