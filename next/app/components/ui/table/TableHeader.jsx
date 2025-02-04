import React from 'react';
import SortButton from './SortButton';
import styles from './table.module.css';

const TableHeader = ({ columns, onSort, sortColumn, sortOrder }) => {
    return (
        <thead className={styles.header}>
            <tr>
                {columns.map((col) => (
                    <th key={col.key} onClick={() => onSort(col.key)}>
                        {col.title}
                        {col.sortable && <SortButton isActive={sortColumn === col.key} direction={sortOrder} />}
                    </th>
                ))}
            </tr>
        </thead>
    );
};

export default TableHeader;