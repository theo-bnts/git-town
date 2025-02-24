'use client';

import React from 'react';

export default function EmptyTableCard ({message = 'Aucune donnée disponible'}) {
  <div className="flex items-center justify-center p-6 border border-gray-200 rounded-lg bg-white shadow-md">
    <p className="text-gray-600 text-center">{message}</p>
  </div>
}
