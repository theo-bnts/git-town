'use client';

import React from 'react';

export default function TableToolbar({ children }) {
  return (
    <div className="flex items-center justify-start pb-8 relative z-20">
      <div className="space-x-4">
        {children}
      </div>
    </div>
  );
}
