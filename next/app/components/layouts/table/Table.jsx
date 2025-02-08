"use client";

import React, { useState, useEffect } from "react";
import TableHeader from "./TableHeader";
import TableRow from "./TableRow";

const Table = ({ columns, data }) => {
  const [sortedData, setSortedData] = useState(data);
  const [sortColumn, setSortColumn] = useState(null);
  const [sortOrder, setSortOrder] = useState("asc");

  const handleSort = (columnKey) => {
    const newOrder =
      sortColumn === columnKey && sortOrder === "asc" ? "desc" : "asc";
    setSortColumn(columnKey);
    setSortOrder(newOrder);

    const sorted = [...data].sort((a, b) => {
      if (!columnKey) return 0;
      return newOrder === "asc"
        ? a[columnKey] > b[columnKey]
          ? 1
          : -1
        : a[columnKey] < b[columnKey]
        ? 1
        : -1;
    });

    setSortedData(sorted);
  };

  useEffect(() => {
    setSortedData(data);
  }, [data]);

  return (
    <div className="max-w-screen-xl mx-auto px-4">
      <div className="overflow-auto" style={{ maxHeight: "calc(100vh - 50px)" }}>
        <table className="border-collapse w-full table-auto">
          <TableHeader
            columns={columns}
            onSort={handleSort}
            sortColumn={sortColumn}
            sortOrder={sortOrder}
          />
          <tbody>
            {sortedData.map((row, index) => (
              <TableRow key={index} rowData={row} columns={columns} />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Table;
