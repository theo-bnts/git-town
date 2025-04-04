// /app/components/layout/table/TableToolbar.jsx
'use client';

import React from 'react';

export default function TableToolbar({ children }) {
  return (
    <div className="flex items-center justify-start">
      <div className="space-x-4">
        {children}
      </div>
    </div>
  );
}
