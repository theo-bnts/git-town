"use client";

import React, { useState } from 'react';
import TableHeader from './TableHeader';
import TableRow from './TableRow';
import styles from './table.module.css';

const Table = ({ columns, data }) => {
    const [sortColumn, setSortColumn] = useState(null);
    const [sortOrder, setSortOrder] = useState('asc');

    const handleSort = (columnKey) => {
        const newOrder = sortColumn === columnKey && sortOrder === 'asc' ? 'desc' : 'asc';
        setSortColumn(columnKey);
        setSortOrder(newOrder);
    };

    const sortedData = [...data].sort((a, b) => {
        if (!sortColumn) return 0;
        return sortOrder === 'asc'
            ? a[sortColumn] > b[sortColumn] ? 1 : -1
            : a[sortColumn] < b[sortColumn] ? 1 : -1;
    });

    return (
        <table className={styles.table}>
            <TableHeader columns={columns} onSort={handleSort} sortColumn={sortColumn} sortOrder={sortOrder} />
            <tbody>
                {sortedData.map((row, index) => (
                    <TableRow key={index} rowData={row} columns={columns} />
                ))}
            </tbody>
        </table>
    );
};

export default Table;