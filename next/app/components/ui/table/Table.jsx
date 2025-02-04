"use client";

import React, { useState } from 'react';
import TableHeader from './TableHeader';
import TableRow from './TableRow';
import { 
  MoveToStartIcon, 
  MoveToEndIcon, 
  ArrowLeftIcon, 
  ArrowRightIcon 
} from '@primer/octicons-react';

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
      <table className="border-collapse table-auto w-auto">
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
    <div className="flex items-center justify-center mt-2 gap-2 text-base text-gray-600">
        {/* Bouton aller à la première page */}
        <button
        onClick={() => setCurrentPage(1)}
        disabled={currentPage === 1}
        className="p-2 rounded disabled:text-gray-400 transition-colors duration-200 hover:bg-gray-200"
        >
        <MoveToStartIcon size={20} />
        </button>

        {/* Bouton page précédente */}
        <button
        onClick={() => setCurrentPage(currentPage - 1)}
        disabled={currentPage === 1}
        className="p-2 rounded disabled:text-gray-400 transition-colors duration-200 hover:bg-gray-200"
        >
        <ArrowLeftIcon size={20} />
        </button>

        {/* Texte indicateur de page */}
        <span className="px-2">
        {currentPage} / {totalPages}
        </span>

        {/* Bouton page suivante */}
        <button
        onClick={() => setCurrentPage(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="p-2 rounded disabled:text-gray-400 transition-colors duration-200 hover:bg-gray-200"
        >
        <ArrowRightIcon size={20} />
        </button>

        {/* Bouton aller à la dernière page */}
        <button
        onClick={() => setCurrentPage(totalPages)}
        disabled={currentPage === totalPages}
        className="p-2 rounded disabled:text-gray-400 transition-colors duration-200 hover:bg-gray-200"
        >
        <MoveToEndIcon size={20} />
        </button>
    </div>
    )}
    </>
  );
};

export default Table;