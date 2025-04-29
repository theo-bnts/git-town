'use client';

import React from 'react';

export default function TableSkeleton({ cols = 4, rows = 8 }) {
  return (
    <div className="animate-pulse w-full">
      {Array.from({ length: rows }).map((_, r) => (
        <div key={r} className="flex">
          {Array.from({ length: cols }).map((__, c) => (
            <div key={c} className="bg-gray-300 h-6 flex-1 m-1 rounded" />
          ))}
        </div>
      ))}
    </div>
  );
}
