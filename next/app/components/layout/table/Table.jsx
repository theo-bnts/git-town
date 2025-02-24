'use client';

import React, { useState, useEffect, useRef } from 'react';

import EmptyTableCard from '@/app/components/layout/table/EmptyTableCard';
import TableHeader from '@/app/components/layout/table/TableHeader';
import TableRow from '@/app/components/layout/table/TableRow';

export default function Table ({ columns, data }) {
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
    const newOrder = (sortColumn === columnKey && sortOrder === 'asc') 
      ? 'desc' 
      : 'asc';
    setSortColumn(columnKey);
    setSortOrder(newOrder);

    const sorted = [...data].sort((a, b) => {
      if (!columnKey) return 0;
      return newOrder === 'asc'
        ? a[columnKey] > b[columnKey]
          ? 1
          : -1
        : a[columnKey] < b[columnKey]
          ? 1
          : -1;
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
    <div className="max-w-screen-xl mx-auto px-4">
      <div
        ref={containerRef}
        className="overflow-auto"
        style={{ maxHeight: "calc(100vh - 50px)" }}
      >
        <table className="border-collapse w-full table-auto">
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
};
