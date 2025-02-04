"use client";

import React, { useState } from 'react';
import TableHeader from './TableHeader';
import TableRow from './TableRow';

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
      <table className="w-full border-collapse">
        <TableHeader
          columns={columns}
          onSort={handleSort}
          sortColumn={sortColumn}
          sortOrder={sortOrder}
        />
        <tbody>
          {currentRows.map((row, index) => (
            <TableRow key={index} rowData={row} columns={columns} />
          ))}
        </tbody>
      </table>

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center mt-4 gap-2">
          <button
            onClick={() => setCurrentPage(currentPage - 1)}
            disabled={currentPage === 1}
            className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors duration-300"
          >
            ⬅ Précédent
          </button>
          <span className="font-bold">Page {currentPage} sur {totalPages}</span>
          <button
            onClick={() => setCurrentPage(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors duration-300"
          >
            Suivant ➡
          </button>
        </div>
      )}
    </>
  );
};

export default Table;