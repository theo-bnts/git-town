"use client";

import React, { useState, useEffect, useRef } from "react";
import TableHeader from "./TableHeader";
import TableRow from "./TableRow";

const Table = ({ columns, data, rowsPerPage = 10 }) => {
  const [visibleRows, setVisibleRows] = useState(data.slice(0, rowsPerPage));
  const [sortColumn, setSortColumn] = useState(null);
  const [sortOrder, setSortOrder] = useState("asc");
  const [loading, setLoading] = useState(false);
  const observerRef = useRef(null);

  useEffect(() => {
    if (!observerRef.current) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const lastEntry = entries[0];
        if (lastEntry.isIntersecting && !loading) {
          loadMoreRows();
        }
      },
      { threshold: 1 }
    );

    observer.observe(observerRef.current);

    return () => observer.disconnect();
  }, [loading]);

  const loadMoreRows = () => {
    if (visibleRows.length >= data.length) return;
    setLoading(true);

    setTimeout(() => {
      setVisibleRows((prevRows) =>
        data.slice(0, prevRows.length + rowsPerPage)
      );
      setLoading(false);
    }, 500);
  };

  const handleSort = (columnKey) => {
    const newOrder =
      sortColumn === columnKey && sortOrder === "asc" ? "desc" : "asc";
    setSortColumn(columnKey);
    setSortOrder(newOrder);

    const sortedData = [...data].sort((a, b) => {
      if (!columnKey) return 0;
      return newOrder === "asc"
        ? a[columnKey] > b[columnKey]
          ? 1
          : -1
        : a[columnKey] < b[columnKey]
        ? 1
        : -1;
    });

    setVisibleRows(sortedData.slice(0, visibleRows.length)); 
  };

  return (
    <div className="max-w-screen-xl mx-auto px-4">
      <div className="overflow-x-auto">
        <table className="border-collapse w-full table-auto mx-auto">
          <TableHeader columns={columns} onSort={handleSort} sortColumn={sortColumn} sortOrder={sortOrder} />
          <tbody>
            {visibleRows.map((row, index) => (
              <TableRow key={index} rowData={row} columns={columns} />
            ))}
            <tr ref={observerRef}>
              <td colSpan={columns.length} className="py-4 text-center text-gray-500">
                {loading ? "Chargement..." : ""}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Table;