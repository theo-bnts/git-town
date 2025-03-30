// /app/components/layout/table/Table.jsx
'use client';

import React, { useState, useEffect, useRef } from 'react';

import EmptyTableCard from '@/app/components/layout/table/EmptyTableCard';
import TableHeader from '@/app/components/layout/table/TableHeader';
import TableRow from '@/app/components/layout/table/TableRow';
import TableToolbar from '@/app/components/layout/table/TableToolbar';

export default function Table({ columns, data, toolbarContents }) {

  const [sortedData, setSortedData] = useState(data);
  const [visibleCount, setVisibleCount] = useState(0);
  const [sortColumn, setSortColumn] = useState(null);
  const [sortOrder, setSortOrder] = useState('asc');

  const containerRef = useRef(null);
  const sentinelRef = useRef(null);
  const rowHeight = 50;

  const loadMoreRows = () => {
    if (containerRef.current) {
      const containerHeight = containerRef.current.clientHeight;
      const rowsToAdd = Math.ceil(containerHeight / rowHeight);
      setVisibleCount((prev) => Math.min(sortedData.length, prev + rowsToAdd));
    }
  };

  useEffect(() => {
    if (containerRef.current) {
      const containerHeight = containerRef.current.clientHeight;
      const initialRows = Math.ceil(containerHeight / rowHeight);
      setVisibleCount(initialRows);
    }
  }, [containerRef, sortedData]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const lastEntry = entries[0];
        if (lastEntry.isIntersecting) loadMoreRows();
      },
      { threshold: 0.1, rootMargin: '0px 0px 20px 0px' }
    );
    if (sentinelRef.current) {
      observer.observe(sentinelRef.current);
    }
    return () => observer.disconnect();
  }, [sentinelRef, sortedData, visibleCount]);

  const handleSort = (columnKey) => {
    const newOrder = (sortColumn === columnKey && sortOrder === 'asc') ? 'desc' : 'asc';
    setSortColumn(columnKey);
    setSortOrder(newOrder);

    const sorted = [...data].sort((a, b) => {
      if (!columnKey) return 0;
      return newOrder === 'asc'
        ? a[columnKey] > b[columnKey] ? 1 : -1
        : a[columnKey] < b[columnKey] ? 1 : -1;
    });
    setSortedData(sorted);
    if (containerRef.current) {
      const containerHeight = containerRef.current.clientHeight;
      const initialRows = Math.ceil(containerHeight / rowHeight);
      setVisibleCount(initialRows);
    }
  };

  useEffect(() => {
    setSortedData(data);
    if (containerRef.current) {
      const containerHeight = containerRef.current.clientHeight;
      const initialRows = Math.ceil(containerHeight / rowHeight);
      setVisibleCount(initialRows);
    }
  }, [data]);

  return (
    <div className="w-full max-w-7xl px-4 mx-auto">
      <TableToolbar>
        {toolbarContents}
      </TableToolbar>
  
      <div
        ref={containerRef}
        className="w-full overflow-x-auto overflow-y-auto"
        style={{ maxHeight: "calc(100vh - 50px)" }}
      >
        <table className="min-w-[800px] border-collapse table-auto">
          <TableHeader
            columns={columns}
            onSort={handleSort}
            sortColumn={sortColumn}
            sortOrder={sortOrder}
          />
          <tbody>
            {sortedData.length > 0 ? (
              <>
                {sortedData.slice(0, visibleCount).map((row, index) => (
                  <TableRow key={index} rowData={row} columns={columns} />
                ))}
                <tr ref={sentinelRef}>
                  <td colSpan={columns.length}></td>
                </tr>
              </>
            ) : (
              <tr>
                <td colSpan={columns.length} className="py-4">
                  <EmptyTableCard />
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
  
}