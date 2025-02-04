import React from 'react';
import TableCell from './TableCell';
import styles from './table.module.css';

const TableRow = ({ rowData, columns }) => {
    return (
        <tr className={styles.row}>
            {columns.map((col) => (
                <TableCell key={col.key} value={rowData[col.key]} />
            ))}
        </tr>
    );
};

export default TableRow;