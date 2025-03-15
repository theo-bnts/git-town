'use client';

import React from 'react';

export default function EmptyListCard({ message = 'Aucune option disponible' }) {
  return (
    <div className="flex items-center justify-center px-4 py-2 border border-gray-200 rounded-lg bg-white">
      <p className="text-gray-600 text-center">{message}</p>
    </div>
  );
}