"use client";

import React, { useState } from 'react';
import TableHeader from './TableHeader';
import TableRow from './TableRow';
import styles from './table.module.css';

const Table = ({ columns, data, rowsPerPage = 5 }) => {
    const [sortColumn, setSortColumn] = useState(null);
    const [sortOrder, setSortOrder] = useState('asc');
    const [currentPage, setCurrentPage] = useState(1);

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

    // Pagination
    const indexOfLastRow = currentPage * rowsPerPage;
    const indexOfFirstRow = indexOfLastRow - rowsPerPage;
    const currentRows = sortedData.slice(indexOfFirstRow, indexOfLastRow);
    const totalPages = Math.ceil(data.length / rowsPerPage);

    return (
        <>
            <table className={styles.table}>
                <TableHeader columns={columns} onSort={handleSort} sortColumn={sortColumn} sortOrder={sortOrder} />
                <tbody>
                    {currentRows.map((row, index) => (
                        <TableRow key={index} rowData={row} columns={columns} />
                    ))}
                </tbody>
            </table>

            {/* Pagination Controls */}
            {totalPages > 1 && (
                <div className={styles.pagination}>
                    <button 
                        onClick={() => setCurrentPage(currentPage - 1)} 
                        disabled={currentPage === 1}
                    >
                        ⬅ Précédent
                    </button>
                    <span> Page {currentPage} sur {totalPages} </span>
                    <button 
                        onClick={() => setCurrentPage(currentPage + 1)} 
                        disabled={currentPage === totalPages}
                    >
                        Suivant ➡
                    </button>
                </div>
            )}
        </>
    );
};

export default Table;