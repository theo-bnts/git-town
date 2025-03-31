// /app/components/layout/table/Table.jsx
'use client';

import React, { useState, useEffect, useRef, useMemo } from 'react';

import ComboBox from '@/app/components/ui/combobox/ComboBox';
import EmptyTableCard from '@/app/components/layout/table/EmptyTableCard';
import TableHeader from '@/app/components/layout/table/TableHeader';
import TableRow from '@/app/components/layout/table/TableRow';
import TableToolbar from '@/app/components/layout/table/TableToolbar';

export default function Table({ columns, data, toolbarContents }) {
  const [visibleCount, setVisibleCount] = useState(0);
  const [sortColumn, setSortColumn] = useState(null);
  const [sortOrder, setSortOrder] = useState('asc');
  const [filterValues, setFilterValues] = useState({});

  const containerRef = useRef(null);
  const sentinelRef = useRef(null);
  const rowHeight = 50;

  const processedData = useMemo(() => {
    let filtered = data.filter(row => {
      return Object.entries(filterValues).every(([key, filterValue]) => {
        if (!filterValue || filterValue === '') return true;
        const cellValue = row[key];
        if (!cellValue) return false;
        if (typeof cellValue === 'string') {
          return cellValue.toLowerCase().includes(filterValue.toLowerCase());
        }
        return cellValue === filterValue;
      });
    });
    if (sortColumn) {
      filtered.sort((a, b) => {
        if (!sortColumn) return 0;
        return sortOrder === 'asc'
          ? a[sortColumn] > b[sortColumn] ? 1 : -1
          : a[sortColumn] < b[sortColumn] ? 1 : -1;
      });
    }
    return filtered;
  }, [data, filterValues, sortColumn, sortOrder]);

  const loadMoreRows = () => {
    if (containerRef.current) {
      const containerHeight = containerRef.current.clientHeight;
      const rowsToAdd = Math.ceil(containerHeight / rowHeight);
      setVisibleCount((prev) => Math.min(processedData.length, prev + rowsToAdd));
    }
  };

  useEffect(() => {
    if (containerRef.current) {
      const containerHeight = containerRef.current.clientHeight;
      const initialRows = Math.ceil(containerHeight / rowHeight);
      setVisibleCount(initialRows);
    }
  }, [containerRef, processedData]);

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
  }, [sentinelRef, processedData, visibleCount]);

  const handleSort = (columnKey) => {
    const newOrder = (sortColumn === columnKey && sortOrder === 'asc') ? 'desc' : 'asc';
    setSortColumn(columnKey);
    setSortOrder(newOrder);
  };

  const handleFilterChange = (columnKey, value) => {
    setFilterValues(prev => ({ ...prev, [columnKey]: value }));
    if (containerRef.current) {
      const containerHeight = containerRef.current.clientHeight;
      const initialRows = Math.ceil(containerHeight / rowHeight);
      setVisibleCount(initialRows);
    }
  };

  const filterComboboxes = columns
    .filter(col => col.key !== 'actions')
    .map(col => {
      const allValues = data.reduce((acc, row) => {
        const cellValue = row[col.key];
        if (!cellValue) return acc;
        if (typeof cellValue === 'string') {
          const tokens = cellValue
            .split(/[,\;\/]+/)
            .map(token => token.trim())
            .filter(token => token);
          return acc.concat(tokens);
        }
        return acc.concat(cellValue);
      }, []);
      const uniqueValues = Array.from(new Set(allValues));
      const comboOptions = uniqueValues.map(option => ({
        id: option,
        value: option,
      }));
      const selectedValue = filterValues[col.key] || '';
      return (
        <ComboBox
          key={col.key}
          placeholder={`${col.title}`}
          options={comboOptions}
          value={selectedValue ? { id: selectedValue, value: selectedValue } : null}
          onSelect={(selectedOption) =>
            handleFilterChange(col.key, selectedOption ? selectedOption.value : '')
          }
        />
      );
    });

  return (
    <div className="w-full max-w-7xl px-4 mx-auto">
      <TableToolbar>
        <div className="flex items-center gap-4">
          {toolbarContents}
          {filterComboboxes}
        </div>
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
            {processedData.length > 0 ? (
              <>
                {processedData.slice(0, visibleCount).map((row, index) => (
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